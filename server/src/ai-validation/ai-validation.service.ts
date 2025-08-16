import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  details: Record<string, Record<string, boolean>>;
}

@Injectable()
export class AiValidationService {
  private model: any | null = null;
  private isAvailable = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isAvailable = true;
    } else {
      this.isAvailable = false;
    }
  }

  async validateGameData(data: any): Promise<ValidationResult> {
    const buildNaiveResult = (): ValidationResult => {
      const { letter, answers, categories } = data || {};
      const details: Record<string, Record<string, boolean>> = {};
      const errors: string[] = [];

      const players = Object.keys(answers || {});
      for (const playerId of players) {
        const playerAnswers = answers[playerId] || {};
        details[playerId] = {};
        for (const cat of categories || []) {
          const value: string = (playerAnswers[cat] || '').toString().trim();
          const ok =
            !!value &&
            (!letter || value[0]?.toLowerCase() === letter?.toLowerCase());
          details[playerId][cat] = ok;
          if (!ok) {
            errors.push(
              `Invalid answer for player ${playerId}, category ${cat}`,
            );
          }
        }
      }

      // If no answers provided (e.g., empty round), consider as invalid
      const valid = errors.length === 0 && players.length > 0;
      return { valid, errors, details };
    };

    try {
      if (!this.isAvailable || !this.model) {
        return buildNaiveResult();
      }

      const safeData = JSON.stringify(data, null, 2);
      const prompt = `
אתה משמש כבודק תשובות למשחק "ארץ עיר".
קיבלת את הנתונים הבאים:
${safeData}

בדוק כל שחקן וכל קטגוריה לפי האות הנתונה.
אם התשובה נכונה - החזר true, אחרת false.

חובה להחזיר JSON בלבד במבנה הבא:
{
  "valid": true/false,
  "errors": ["רשימת שגיאות כלליות"],
  "details": {
    "playerId1": { "קטגוריה1": true/false, "קטגוריה2": true/false },
    "playerId2": { "קטגוריה1": true/false, "קטגוריה2": true/false }
  }
}

חוקים:
- details חייב להכיל את כל השחקנים.
- לכל קטגוריה שציינת במשחק תהיה תשובה true אם נכונה, אחרת false.
- valid = false אם יש לפחות תשובה אחת לא נכונה.
- החזר אך ורק JSON. ללא טקסט נוסף.
`;

      const result = await this.model.generateContent(prompt);
      const textResponse = result.response.text().trim();
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return buildNaiveResult();
      }

      const parsed: ValidationResult = JSON.parse(jsonMatch[0]);
      if (
        typeof parsed.valid !== 'boolean' ||
        !Array.isArray(parsed.errors) ||
        typeof parsed.details !== 'object'
      ) {
        return buildNaiveResult();
      }

      return parsed;
    } catch (err) {
      // Fallback gracefully instead of crashing the flow
      return buildNaiveResult();
    }
  }
}
