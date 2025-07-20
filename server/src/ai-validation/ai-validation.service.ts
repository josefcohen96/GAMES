import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  details: Record<string, boolean>;
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

      const prompt = `
אתה משמש כבודק נתונים למשחק "ארץ עיר". קיבלת את הנתונים הבאים:
${safeData}

בצע את הבדיקות הבאות:
1. האם כל הערכים חוקיים? (מדינה קיימת, עיר קיימת במדינה וכו').
2. החזר אך ורק JSON תקין במבנה הבא (אל תוסיף טקסט מסביב):
{
  "valid": true/false,
  "errors": ["רשימת שגיאות בעברית"],
  "details": { "שם_קטגוריה": true/false }
}

שים לב:
- כל ההסברים והשגיאות יהיו בעברית בלבד.
- אל תוסיף טקסט נוסף מחוץ ל-JSON.
`;

      // שליחת הבקשה ל-AI
      const result = await this.model.generateContent(prompt);
      const textResponse = result.response.text().trim();

      // שליפת JSON מתוך הטקסט (במקרה והמודל הוסיף משהו)
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('לא נמצא JSON תקין בתשובת ה-AI');
      }

      const parsed: ValidationResult = JSON.parse(jsonMatch[0]);

      // בדיקת מבנה התשובה
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