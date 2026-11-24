const DIRECT_CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bit's\b/g, 'it is'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bhadn't\b/g, 'had not'],
  [/\bwon't\b/g, 'will not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/\bcouldn't\b/g, 'could not'],
  [/\bshouldn't\b/g, 'should not'],
  [/\bmustn't\b/g, 'must not'],
  [/\bneedn't\b/g, 'need not'],
  [/\bi've\b/g, 'i have'],
  [/\byou've\b/g, 'you have'],
  [/\bwe've\b/g, 'we have'],
  [/\bthey've\b/g, 'they have'],
  [/\bi'll\b/g, 'i will'],
  [/\byou'll\b/g, 'you will'],
  [/\bhe'll\b/g, 'he will'],
  [/\bshe'll\b/g, 'she will'],
  [/\bit'll\b/g, 'it will'],
  [/\bwe'll\b/g, 'we will'],
  [/\bthey'll\b/g, 'they will'],
  [/\bthere's\b/g, 'there is'],
  [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bwho's\b/g, 'who is'],
  [/\bwhere's\b/g, 'where is'],
  [/\bhow's\b/g, 'how is'],
  [/\blet's\b/g, 'let us'],
];

const AMBIGUOUS_CONTRACTIONS: Array<{ pattern: RegExp; variants: string[] }> = [
  { pattern: /\b(i|you|he|she|it|we|they)'d\b/g, variants: ['$1 would', '$1 had'] },
  { pattern: /\b(he|she|it|there|that|what|who|where|how)'s\b/g, variants: ['$1 is', '$1 has'] },
  { pattern: /\b(i|you|he|she|it|we|they) (would|had)\b/g, variants: ['$1 would', '$1 had', "$1'd"] },
  { pattern: /\b(he|she|it|there|that|what|who|where|how) (is|has)\b/g, variants: ['$1 is', '$1 has', "$1's"] },
];

export function normalizeAnswer(raw: string): string {
  return raw
    .replace(/[\u2018\u2019`]/g, "'")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim();
}

function expandVariants(normalized: string): Set<string> {
  const results = new Set<string>([normalized]);

  let direct = normalized;
  for (const [pattern, replacement] of DIRECT_CONTRACTIONS) {
    direct = direct.replace(pattern, replacement);
  }
  results.add(direct);

  const queue = Array.from(results);
  for (const candidate of queue) {
    for (const rule of AMBIGUOUS_CONTRACTIONS) {
      if (rule.pattern.test(candidate)) {
        rule.pattern.lastIndex = 0;
        for (const v of rule.variants) {
          const next = candidate.replace(rule.pattern, v);
          let nextDirect = next;
          for (const [pattern, replacement] of DIRECT_CONTRACTIONS) {
            nextDirect = nextDirect.replace(pattern, replacement);
          }
          results.add(next);
          results.add(nextDirect);
        }
      }
      rule.pattern.lastIndex = 0;
    }
  }

  return results;
}

export interface GradeResult {
  isCorrect: boolean;
  matchedAnswer?: string;
  normalizedUser: string;
}

export function gradeAnswer(userInput: string, acceptedAnswers: string[]): GradeResult {
  const normalizedUser = normalizeAnswer(userInput);
  if (!normalizedUser) {
    return { isCorrect: false, normalizedUser };
  }

  const userVariants = expandVariants(normalizedUser);

  for (const accepted of acceptedAnswers) {
    const normalizedAccepted = normalizeAnswer(accepted);
    if (!normalizedAccepted) continue;
    const acceptedVariants = expandVariants(normalizedAccepted);
    for (const uv of userVariants) {
      if (acceptedVariants.has(uv)) {
        return {
          isCorrect: true,
          matchedAnswer: accepted,
          normalizedUser,
        };
      }
    }
  }

  return { isCorrect: false, normalizedUser };
}
