/**
 * Quotes Data
 * Collection of quotes organized by persona
 */

(function() {
    'use strict';

    const quotesData = {
        founder: [
            {
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb"
            },
            {
                text: "Success is going from failure to failure without losing enthusiasm.",
                author: "Winston Churchill"
            },
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            }
        ],
        operator: [
            {
                text: "Systems run the business and people run the systems.",
                author: "Michael Gerber"
            },
            {
                text: "Culture eats strategy for breakfast.",
                author: "Peter Drucker"
            }
        ],
        investor: [
            {
                text: "Rule No.1: Never lose money. Rule No.2: Never forget rule No.1.",
                author: "Warren Buffett"
            },
            {
                text: "The stock market is a device for transferring money from the impatient to the patient.",
                author: "Warren Buffett"
            }
        ],
        dad: [
            {
                text: "The days are long, but the years are short.",
                author: "Gretchen Rubin"
            },
            {
                text: "Children are not a distraction from more important work. They are the most important work.",
                author: "C.S. Lewis"
            }
        ]
    };

    // Create combined "all" category
    quotesData.all = [
        ...quotesData.founder,
        ...quotesData.operator,
        ...quotesData.investor,
        ...quotesData.dad
    ];

    // Export to global scope
    window.quotesData = quotesData;

})();