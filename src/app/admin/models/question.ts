export interface Question {
    questionNumber: number;
    questionText: string,
    prefixText: string,
    suffixText: string,
    sortOrder: number,
    options: [
        {
        optionLabel: string,
        optionText: string,
        sortOrder: number
        }
    ],
    correctOptionId: number,
    correctText: string,
    alternativeAnswers: [
        string
    ]
}
