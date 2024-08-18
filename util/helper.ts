import commandsData from "../data/commands.json"
export function getPageFromText(text: string): string | null {
    // Data halaman dan sinonimnya
    const pageMapping = commandsData.halaman

    // Normalize text
    const normalizedText = text.toLowerCase().trim();

    // Loop through each page and check if the text is in the list of synonyms
    for (const [page, synonyms] of Object.entries(pageMapping)) {
        if (synonyms.includes(normalizedText)) {
            return page; // Return the corresponding page if found
        }
    }

    return text;
}

export function isNumeric(num: any){
    return !isNaN(num)
}