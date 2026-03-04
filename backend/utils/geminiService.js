import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    process.exit(1);
}

/**
 * generate flashcards from text
 * @param {string} text - The input text to generate flashcards from.
 * @param {number} count - The number of flashcards to generate.
 * @returns {Promise<Array<{question : string , answer : string , difficulty : string}>>} - An array of generated flashcards.
 */

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate ${count} flashcards from the following text.
    Format each flashcard as : 
    Q: [clear , specific question]
    A: [concise , accurate answer]
    D: [difficulty level - easy , medium , hard]

    Separate flashcards with "---"
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text.trim();
        const cards = generatedText.split("---").filter(card => card.trim());
        const flashcards = [];

        for (const card of cards) {
            const lines = card.trim().split("\n");
            let question = "";
            let answer = "";
            let difficulty = "medium";
            for (const line of lines) {
                if (line.startsWith("Q:")) {
                    question = line.substring(2).trim();
                } else if (line.startsWith("A:")) {
                    answer = line.substring(2).trim();
                } else if (line.startsWith("D:")) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }
            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }
        return flashcards.slice(0, count);
    }
    catch (error) {
        console.error("Gemini API error", error);
        throw new Error("Failed to generate Flashcards");
    }
};

/**
 * generate quiz questions
 * @param {string} text - document text
 * @param {number} numQuestions - Number of questions 
 * @returns {Promise<Array<{question : string , options : Array , correctAnswer : string , }>>}
 */

export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as : 
    Q: [Question]
    Q1: [Option 1]
    Q2: [Option 2]
    Q3: [Option 3]
    Q4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty : easy, medium, hard]
    
    Seperate questions with "---"
    
    Text: 
    ${text.substring(0, 15000)};`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        const questions = [];
        const questionBlocks = generatedText.split("---").filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split("\n");
            let question = "";
            let options = [];
            let correctAnswer = "";
            let explanation = "";
            let difficulty = "medium";
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("Q:")) {
                    question = trimmed.substring(2).trim();
                }
                else if (/^Q[1-4]:/.test(trimmed)) {
                    options.push(trimmed.replace(/^Q[1-4]:/, "").trim());
                }
                else if (trimmed.startsWith("C:")) {
                    correctAnswer = line.substring(2).trim();
                }
                else if (trimmed.startsWith("E:")) {
                    explanation = line.substring(2).trim();
                }
                else if (trimmed.startsWith("D:")) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }
            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }
        return questions.slice(0, numQuestions);
    }
    catch (error) {
        console.error("Gemini API error", error);
        throw new Error("Failed to generate Quiz");
    }
};

/**
 * generate summary
 * @param {string} text - document text
 * @returns {Promise<string>}
 */

export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text , highlighting the key concepts , main ideas and important points .Keep the summary clear and structured 
    Text : ${text.substring(0, 15000)};`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text.trim();
        return generatedText;
    }
    catch (error) {
        console.error("Gemini API error", error);
        throw new Error("Failed to generate Summary");
    }
};

/**
 * chat
 * @param {string} text - document text
 * @returns {Promise<string>}
 * @param {Array<Object>} chunks - document chunks
 */

export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((chunk, index) => {
        return `Chunk ${index + 1}\n${chunk.text}`;
    }).join('\n\n');

    const prompt = `Based on the following context from a document , Analyse the context and answer the user's question . If the answer is not in the context , say so
    Context ${context}
    Question: ${question}
    Answer: `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text.trim();
        return generatedText;
    }
    catch (error) {
        console.error("Gemini API error", error);
        throw new Error("Failed to generate Summary");
    }
}

/**
 * explain concept
 * @param {string} text - document text
 * @param {string} context - relevant context 
 * @returns {Promise<string>}
 */

export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of ${concept} bassed on the following context from a document.
    Provide a clear , educational explanation that's easy to understand.
    Include examples and real world applications if relevant. 
    
    Context : ${context.substring(0, 10000)}`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        return generatedText;

    }
    catch (err) {
        console.error("Gemini API error", err);
        throw new Error("Failed to explain concept");
    }
}; 