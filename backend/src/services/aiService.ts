import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(apiKey);

export const generateAssessmentPaper = async (
  totalQuestions: number,
  totalMarks: number,
  questionTypes: string[],
  additionalInstructions: string,
  subject: string,
  grade: string,
  fileContent?: string
) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        description: "List of sections in the exam paper",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "Title of the section, e.g. 'Section A', 'Short Answer Questions'"
            },
            instruction: {
              type: SchemaType.STRING,
              description: "Instruction for the section, e.g. 'Attempt all questions. Each question carries 2 marks.'"
            },
            questions: {
              type: SchemaType.ARRAY,
              description: "List of questions in this section",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  text: {
                    type: SchemaType.STRING,
                    description: "The actual question text"
                  },
                  difficulty: {
                    type: SchemaType.STRING,
                    description: "Difficulty of the question",
                    enum: ["Easy", "Moderate", "Challenging"]
                  },
                  marks: {
                    type: SchemaType.INTEGER,
                    description: "Marks awarded for this question"
                  }
                },
                required: ["text", "difficulty", "marks"]
              }
            }
          },
          required: ["title", "instruction", "questions"]
        }
      }
    }
  });

  const prompt = `
    Generate an official exam paper for:
    - Subject: ${subject}
    - Student Grade/Class: ${grade}
    
    ${fileContent ? `Reference Material (use this as context for generating questions):\n${fileContent}\n---\n` : ''}
    Generate an assessment paper based on the following requirements:
    - Total Questions: ${totalQuestions}
    - Total Marks: ${totalMarks}
    - Question Types: ${questionTypes.join(', ')}
    - Additional Instructions: ${additionalInstructions}
    
    Ensure that the questions generated are educational, age-appropriate for ${grade}, and cover topics strictly related to the subject: ${subject}.
    Ensure that the sum of marks for all questions exactly matches ${totalMarks}, and the total number of questions exactly matches ${totalQuestions}.
    Distribute the questions into logical sections based on question types or difficulty.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating assessment:", error);
    throw new Error("Failed to generate assessment using Gemini API.");
  }
};
