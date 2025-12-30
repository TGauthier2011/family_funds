'use server';
/**
 * @fileOverview Provides AI-powered insights and recommendations based on user spending patterns.
 *
 * - getSpendingInsights - A function that retrieves spending insights and recommendations.
 * - SpendingInsightsInput - The input type for the getSpendingInsights function.
 * - SpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  spendingData: z
    .string()
    .describe("User's spending data in JSON format, including categories, amounts, and dates."),
  financialGoals: z
    .string()
    .optional()
    .describe("User's financial goals in JSON format, if available."),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe("AI-powered insights and recommendations for the user, based on their spending patterns."),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const spendingInsightsPrompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a personal finance advisor providing insights and recommendations based on spending patterns.

  Analyze the provided spending data and financial goals to provide personalized advice.

  Spending Data:
  {{spendingData}}

  Financial Goals (if available):
  {{#if financialGoals}}
  {{financialGoals}}
  {{else}}
  No specific financial goals provided.
  {{/if}}

  Provide insights and recommendations to help the user save money and make better financial decisions.
  Focus on actionable advice based on the data provided, and be concise.
  `, 
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await spendingInsightsPrompt(input);
    return output!;
  }
);
