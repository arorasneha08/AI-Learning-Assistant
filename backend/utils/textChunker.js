/**
 * Split text into chunks for better AI processing 
 * @param {string} text - The input text to be chunked
 * @param {number} chunkSize - The maximum size of each chunk
 * @param {number} overlap - The number of characters to overlap between chunks
 * @returns {Array<{Content : string , chunkIndex : number , pageNumber : number}>} - An array of text chunks
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || text.trim().length === 0) {
        return [];
    }
    const cleanedText = text.replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .replace(/\n /g, '\n')
        .replace(/ \n/g, '\n')
        .trim();

    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // if single paragraph exceeeds chunk size split it by words  

        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join("\n\n"),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            // split large para into word-based chunks
            for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);
                chunks.push({
                    content: chunkWords.join(" "),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });

                if (i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        // if adding the paragraph exceeds chunk size, save the current chunk 
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join("\n\n"),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
            const prevChunkText = currentChunk.join(" ");
            const prevWords = prevChunkText.trim().split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(" ");

            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        }
        else {
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join("\n\n"),
            chunkIndex: chunkIndex,
            pageNumber: 0
        });
    }
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(" "),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
            if (i + chunkSize >= allWords.length) break;
        }
    }
    return chunks;
}

/**
 * find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - The array of text chunks to search through
 * @param {string} query - The search query to match against the chunks
 * @param {number} maxChunks - The maximum number of relevant chunks to return
 * @return {Array<Object>} - An array of relevant chunks sorted by relevance
 */

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }
    const stopWords = new Set(["the", "is", "in", "and", "to", "of", "a", "that", "it", "with", "as", "for", "was", "on", "are", "by", "this", "be"]);
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
    if (queryWords.length === 0) {
        return chunks.slice(0, maxChunks).map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber
        }));
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        let contentWords = content.split(/\s+/).length;
        let score = 0;

        // Score each query word
        for (const word of queryWords) {
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
            score += exactMatches * 3;

            const partialMatches = (content.match(new RegExp(word, "g")) || []).length - exactMatches;
            score += Math.max(0, partialMatches) * 1.5; // partial matches are less valuable
        }

        const uniqueWordsFound = queryWords.filter(word => content.includes(word)).length;
        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2; // bonus for multiple query words found
        }
        const normalizedScore = score / Math.sqrt(contentWords); // normalize by content length
        const positionBonus = Math.max(0, 1 - index / chunks.length) * 0.1; // bonus for earlier chunks
        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore + positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound,
        }
    });

    return scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a, b) =>{
        if((b.score !== a.score)) {
            return b.score - a.score; // primary sort by score
        }
        if(b.matchedWords !== a.matchedWords) {
            return b.matchedWords - a.matchedWords; // secondary sort by number of matched words
        }
        return a.chunkIndex - b.chunkIndex; // tertiary sort by original order
    })
    .slice(0, maxChunks);
};