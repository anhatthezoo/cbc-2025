import { supabase, Report } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

export type SafetyAnalysis = {
  risk: 'low' | 'medium' | 'high';
  shouldBan: boolean;
  reasoning: string;
  patterns: string[];
};

/**
 * Submits a report against a user
 * Decreases their trust score and triggers safety analysis if needed
 */
export async function submitReport(
  reporterId: string,
  reportedUserId: string,
  matchId: string | null,
  reason: string,
  details?: string
): Promise<Report> {
  try {
    // Insert the report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        match_id: matchId,
        reason,
        details: details || null,
      })
      .select()
      .single();

    if (insertError || !report) {
      throw new Error(`Failed to submit report: ${insertError?.message}`);
    }

    // Decrease trust score by 10
    const { error: updateError } = await supabase.rpc('decrement_trust_score', {
      user_id: reportedUserId,
      amount: 10,
    });

    // If the RPC function doesn't exist, do it manually
    if (updateError) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('trust_score')
        .eq('id', reportedUserId)
        .single();

      if (profile) {
        const newScore = Math.max(0, profile.trust_score - 10);
        await supabase
          .from('profiles')
          .update({ trust_score: newScore })
          .eq('id', reportedUserId);
      }
    }

    // Check if user has 2+ reports and trigger analysis
    const { data: reportCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('reported_user_id', reportedUserId);

    if (reportCount && reportCount >= 2) {
      // Run safety analysis asynchronously (don't await)
      analyzeUserSafety(reportedUserId).catch(err =>
        console.error('Safety analysis failed:', err)
      );
    }

    return report;
  } catch (error) {
    console.error('Error in submitReport:', error);
    throw error;
  }
}

/**
 * Analyzes user safety using Claude AI
 * If user has 2+ reports, sends report data to Claude for analysis
 * May result in user ban if deemed necessary
 */
export async function analyzeUserSafety(
  userId: string
): Promise<SafetyAnalysis | null> {
  try {
    // Fetch last 10 reports for the user
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('reason, details, created_at')
      .eq('reported_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (reportsError) {
      throw new Error(`Failed to fetch reports: ${reportsError.message}`);
    }

    if (!reports || reports.length < 2) {
      // Not enough reports to analyze
      return null;
    }

    // Get API key from environment
    const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('EXPO_PUBLIC_ANTHROPIC_API_KEY not set, skipping AI analysis');
      return null;
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey,
    });

    // Prepare report data for Claude
    const reportSummary = reports.map((r, i) => ({
      reportNumber: i + 1,
      reason: r.reason,
      details: r.details,
      date: new Date(r.created_at).toLocaleDateString(),
    }));

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a safety analyst for a campus walking app. Analyze these reports and determine if this user should be banned. Respond ONLY with valid JSON: {risk: 'low'|'medium'|'high', shouldBan: boolean, reasoning: string, patterns: string[]}

Reports:
${JSON.stringify(reportSummary, null, 2)}`,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    let analysis: SafetyAnalysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Invalid response from AI analysis');
    }

    // If Claude recommends banning, update the user
    if (analysis.shouldBan) {
      const { error: banError } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          trust_score: 0,
        })
        .eq('id', userId);

      if (banError) {
        console.error('Failed to ban user:', banError);
      }
    }

    return analysis;
  } catch (error) {
    console.error('Error in analyzeUserSafety:', error);
    throw error;
  }
}

/**
 * Gets all reports filed by a user
 */
export async function getReportsByReporter(
  reporterId: string
): Promise<Report[]> {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', reporterId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return reports || [];
  } catch (error) {
    console.error('Error in getReportsByReporter:', error);
    throw error;
  }
}

/**
 * Gets all reports against a user
 */
export async function getReportsAgainstUser(
  userId: string
): Promise<Report[]> {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reported_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return reports || [];
  } catch (error) {
    console.error('Error in getReportsAgainstUser:', error);
    throw error;
  }
}
