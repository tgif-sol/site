/**
 * Quotes Content Data
 * Collection of quotes organized by category
 */

(function() {
    'use strict';

    const quotesContent = {
        'business': {
            title: 'Business',
            items: [
                'A platform is when the economic value of everybody that uses it exceeds the value of the company that creates it - Bill Gates',
                'Culture is not a noun, it\'s a verb. It means to maintain conditions suitable for growth',
                'Entrepreneurship is a personal growth engine disguised as a business pursuit. - James Clear',
                'Half of entrepreneurship is staying in the game long enough so you can swing for the fences when the right pitch comes.',
                'If you don\'t build your dreams someone will hire you to help build theirs - Tony Gaskin',
                'If you\'re not embarassed by the first version of your product you\'ve launched too late - Reid Hoffman',
                'Stay alive long enough to be the expert',
                'The most uncrowded path to profound wealth is often subtle improvements in an existing industry so beautifully boring as to not attract attention from those attempting to sharpen a unicorn horn instead.',
                'The purpose of business is to create and keep a customer - Peter Drucker'
            ]
        },
        'communication': {
            title: 'Communication',
            items: [
                'Can I be wildly candid with you?',
                'Don\'t pull your punches!',
                'Get to the point!'
            ]
        },
        'health': {
            title: 'Health',
            items: [
                'Let\'s say you have a bunch of fish that are getting sick. Your instinct wouldn\'t be to drug them it would be to clean the tank. - Justin Mares'
            ]
        },
        'investing': {
            title: 'Investing',
            items: [
                'Be greedy when others are fearful - Warren Buffet',
                'Double down on your best relationship. It\'s the investment with the highest return - James Clear',
                'Only invest if the value is worth the price - Warren Buffet',
                'Outsized returns often come from betting against conventional wisdom, and conventional wisdom is usually right - Jeff Bezos'
            ]
        },
        'leadership': {
            title: 'Leadership & Management',
            items: [
                'A B+ is the biggest enemy of the A - Marc Pinkus',
                'A person\'s success in life can be measured by the number of uncomfortable conversations he or she is willing to have - Tim Ferriss',
                'Do the basics excellently',
                'Excellence is the capacity to take pain - Thomas Carlyle',
                'Give me a lever long enough and a fulcrum on which to place it and I will move the world - Archimedes',
                'If you\'re going through Hell, keep going - Winston Churchill',
                'Intelligence is a commodity, integrity is not',
                'Risk more than others think is safe. Care more than others think is wise. Dream more than others think is practical. Expect more than others think is possible - Claude Bissell',
                'Say the thing, the taboo thing, that no one else wants to say but everyone is thinking',
                'The sooner you make a choice, the sooner you can make an adjustment. - James Clear',
                'You can\'t manage what you can\'t measure - Edwards Deming',
                'You want to go fast, go alone. If you want to go far, go together - Robin Jones Gunn'
            ]
        },
        'life': {
            title: 'Life',
            items: [
                'A foreign accent is a sign of bravery - Amy Chua',
                'Discipline equals freedom - Jocko Willick',
                'Don\'t be the best, be the only - Jerry Garcia',
                'Find out who you are and do it on purpose - Dolly Parton',
                'Hope is not a strategy. Luck is not a factor. Fear is not an option. - James Cameron',
                'I have three basic rules. Meeting all three is nearly impossible, but you should try anyway: (1) Don\'t sell anything you wouldn\'t buy yourself. (2) Don\'t work for anyone you don\'t respect and admire. (3) Work only with people you enjoy. - Charlie Munger',
                'On average, bad things happen fast and good things happen slow - Stewart Brand',
                'Reading is training your algo',
                'Take a simple idea and take it seriously. - Charlie Munger',
                'Take care of the downside and the upside takes care of itself - Tim Ferriss',
                'The reasonable man adapts himself to the world: the unreasonable one persists in trying to adapt the world to himself. Therefore all progress depends on the unreasonable man. - George Bernard Shaw',
                'The reward for good work is more work - Tom Sachs',
                'To enjoy your past is to live twice - Derek Sivers',
                'Today\'s laurels are tomorrow\'s compost - Tom Peters',
                'What\'s the ONE call you need to make? - Landmark Forum'
            ]
        },
        'productivity': {
            title: 'Planning & Productivity',
            items: [
                'A year from now you will have wished you started today - Mary Lamb',
                'Build systems not goals - Scott Adams',
                'Build the machine that builds the machine - Elon Musk',
                'Deal with the closest alligator in the swamp - Gordon Thibedeau',
                'Decisions are like hats, haircuts, or tattoos.',
                'Plans are worthless, but planning is everything - Dwight Eisenhower',
                'Start with the end in mind - Stephen Covey',
                'The fastest way to starve a horse is to assign two people to feed it',
                'Time cannot be managed. Only activities can. - Paul Check',
                'To achieve great things two things are needed - a plan and not enough time - Leonard Bernstein',
                'Your inbox is someone else\'s to-do list'
            ]
        },
        'psychology': {
            title: 'Psychology',
            items: [
                'A man always has two reasons for what he does—a good one, and the real one - Pierpoint Morgan',
                'An unexamined life is not worth living. - Socrates',
                'Don\'t make suffering cheap. Don\'t let others take it from you.',
                'Ego is a tool that you should be able to dial up and down if you want to accomplish something ambitious',
                'History never repeats itself. Man always does. - Voltaire',
                'I\'m not interested in whether the glass is half empty or half full. I\'m interested in figuring out how to fill the glass. - Donald Kaberuka',
                'If you don\'t want to be deceived, figure out what you\'re hungry for - Pamela Mayer',
                'Men do not desire to be rich, but to be richer than other men - John Stuart Mill',
                'Mind like water',
                'Self Esteem = Percentage Win Rate',
                'Skill is something you can learn and talent is the rate you will learn skills and the ceiling you can reach with that skill - Dharmesh Shah',
                'The brain is a factory, not a warehouse',
                'Tradition is just peer pressure from dead people',
                'We judge ourselves by our intentions and others by their behavior - Stephen Covey',
                'Your personality is revealed though your weekends - Tyler Cowan'
            ]
        },
        'thinking': {
            title: 'Thinking',
            items: [
                'Invert, always invert',
                'Noise → Data → Information → Knowledge → Understanding → Wisdom. Spend less time at the top of the funnel trying to accumulate data and information and more time converting understanding to wisdom - Dee Hock',
                'Run the simulation - think it through in detail, scenario plan',
                'You\'ve got to have models in your head and you\'ve got to array you experience – both vicarious and direct – onto this latticework of mental models….fortunately, it isn\'t that tough—because eighty or ninety important models will carry about 90% of the freight in making you a worldly wise person. And, of those, only a mere handful really carry very heavy freight - Charlie Munger'
            ]
        }
    };

    // Export to global scope
    window.quotesContent = quotesContent;

})();