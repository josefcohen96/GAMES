import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  details: Record<string, Record<string, boolean>>;
}

@Injectable()
export class AiValidationService {
  private model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async validateGameData(data: any): Promise<ValidationResult> {
    try {
      const safeData = JSON.stringify(data, null, 2);
      console.log("📢 AI Validation Request Data:", safeData);

      const prompt = `
אתה משמש כבודק תשובות למשחק "ארץ עיר".
קיבלת את הנתונים הבאים:
${safeData}

בדוק כל שחקן וכל קטגוריה לפי האות הנתונה.
אם התשובה נכונה - החזר true, אחרת false.

**חובה להחזיר JSON בלבד במבנה הבא:**
{
  "valid": true/false,
  "errors": ["רשימת שגיאות כלליות"],
  "details": {
    "playerId1": { "קטגוריה1": true/false, "קטגוריה2": true/false },
    "playerId2": { "קטגוריה1": true/false, "קטגוריה2": true/false }
  }
}

חוקי:
- details חייב להכיל את כל השחקנים.
- לכל קטגוריה שציינת במשחק תהיה תשובה true אם נכונה, אחרת false.
- valid = false אם יש לפחות תשובה אחת לא נכונה.
- החזר אך ורק JSON. ללא טקסט נוסף.
`;

      const result = await this.model.generateContent(prompt);
      const textResponse = result.response.text().trim();

      console.log("📢 AI Response Text:", textResponse);

      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('לא נמצא JSON תקין בתשובת ה-AI');

      const parsed: ValidationResult = JSON.parse(jsonMatch[0]);

      if (
        typeof parsed.valid !== 'boolean' ||
        !Array.isArray(parsed.errors) ||
        typeof parsed.details !== 'object'
      ) {
        throw new Error('מבנה התשובה שהתקבל מה-AI אינו תקין');
      }

      return parsed;
    } catch (err) {
      console.error('שגיאה באימות עם AI:', err);
      throw new InternalServerErrorException('האימות נכשל');
    }
  }
}
