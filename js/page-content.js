/**
 * Page Content Data
 * Contains all content for the single-page application
 */

window.pageContent = {
    bio: {
        title: "Bio",
        content: `
            <p>Alan Curtis is a Founder, Operator, Investor, and most importantly, a Girl Dad.</p>

            <p>As a Founder, Alan has five exits and has delivered a lifetime 30%+ IRR for investors across $100M+ raised from 75+ venture capital funds and 100+ angel investors.</p>

            <p>As an Operator, Alan has been COO at EigenLayer during a $7B TGE ($EIGEN), CTO of Core Scientific during $4B IPO ($CORZ), and CSO at Blockcap during a $2B merger.</p>

            <p>As an Investor, Alan has invested in 50+ companies (seven unicorns and five exits) and 10+ funds. He was also the first Head of Platform at Blockchain Capital.</p>

            <p>As a Girl Dad, Alan lives with his wife and two daughters outside Boulder, Colorado and is an avid nail polish test subject and stuffie wrangler.</p>

            <h2>2025</h2>
            <h3>Founder and CEO, The Invention Network</h3>
            <p>We help inventors win</p>

            <h2>2024</h2>
            <h3>COO, Eigen Labs</h3>
            <p>Led $7B TGE ($EIGEN) and launched EigenCloud</p>

            <h2>2023</h2>
            <h3>Co-Founder and CEO, Rio Network</h3>
            <p>Acquired by Eigen Labs for team and Liquid Restaking Network tech</p>

            <h2>2022-2025</h2>
            <h3>Co-Founder, ScaleIP</h3>
            <p>Acquired by The Invention Network for team</p>

            <h2>2022</h2>
            <h3>Head of Platform, Blockchain Capital</h3>
            <p>Launched post-investment support program</p>

            <h2>2022</h2>
            <h3>Co-Founder, Multisig Media</h3>
            <p>Acquired by Bitwave to scale media efforts</p>

            <h2>2021</h2>
            <h3>CTO, Core Scientific</h3>
            <p>Turned around technology team for a $4B IPO ($CORZ)</p>

            <h2>2021</h2>
            <h3>CSO, Blockcap</h3>
            <p>Led integrations into Core Scientific after a $2B merger</p>

            <h2>2017-2021</h2>
            <h3>Co-Founder and CEO, RADAR</h3>
            <p>Acquired by Blockcap for staking and trading businesses</p>

            <h2>2016</h2>
            <h3>Co-Founder and CEO, The Horse and I</h3>
            <p>Acquired by The Right Horse for technology platform</p>

            <h2>2014-2017</h2>
            <h3>Program Director, Innosphere</h3>
            <p>Managed accelerator: admissions, curriculum, and digital health vertical</p>

            <h2>2010-2016</h2>
            <h3>Bachelor and Master's Degree, Economics, Business Administration, and Public Health</h3>
            <p>Survived, barely</p>

            <h2>2000-2010</h2>
            <h3>Grew up in Chicago suburbs</h3>
            <p>One giant strip mall</p>

            <h2>1995-2000</h2>
            <h3>Born and raised in New Hampshire</h3>
            <p>Live free or die</p>
        `
    },
    writing: {
        title: "Writing",
        content: `
            <div class="split-view">
                <div class="list-pane">
                    <ul class="post-list">
                        <li><a href="#annual-retro" data-article="annual-retro">Annual Retro</a></li>
                        <li><a href="#asset-classes" data-article="asset-classes">Asset Classes</a></li>
                        <li><a href="#business-operating-systems" data-article="business-operating-systems">Business Operating Systems</a></li>
                        <li><a href="#communities-of-practice" data-article="communities-of-practice">Communities of Practice</a></li>
                        <li><a href="#culture" data-article="culture">Culture</a></li>
                        <li><a href="#entropy-golf" data-article="entropy-golf">Entropy Golf</a></li>
                        <li><a href="#family-strategy" data-article="family-strategy">Family Strategy</a></li>
                        <li><a href="#growth-strategies" data-article="growth-strategies">Growth Strategies</a></li>
                        <li><a href="#health-and-wellness-gear" data-article="health-and-wellness-gear">Health and Wellness Gear</a></li>
                        <li><a href="#latticework" data-article="latticework">Latticework</a></li>
                        <li><a href="#leadership" data-article="leadership">Leadership</a></li>
                        <li><a href="#metrics" data-article="metrics">Metrics</a></li>
                        <li><a href="#seven-basic-plots" data-article="seven-basic-plots">Seven Basic Plots</a></li>
                        <li><a href="#talent-investing" data-article="talent-investing">Talent Investing</a></li>
                        <li><a href="#therapy" data-article="therapy">Therapy</a></li>
                        <li><a href="#truth" data-article="truth">Truth</a></li>
                        <li><a href="#user-manual" data-article="user-manual">User Manual</a></li>
                    </ul>
                </div>
                <div class="reading-pane">
                    <div id="writing-content">
                        <p class="empty-state">Select an article to read</p>
                    </div>
                </div>
            </div>
        `,
        requiresWritingSPA: true
    },
    quotes: {
        title: "Quotes",
        content: `
            <div class="quotes-grid">
                <blockquote class="quote-card" data-persona="founder">
                    <p>"The best time to plant a tree was 20 years ago. The second best time is now."</p>
                    <footer>— Chinese Proverb</footer>
                </blockquote>

                <blockquote class="quote-card" data-persona="operator">
                    <p>"In theory, theory and practice are the same. In practice, they are not."</p>
                    <footer>— Yogi Berra</footer>
                </blockquote>

                <blockquote class="quote-card" data-persona="investor">
                    <p>"Be fearful when others are greedy and greedy when others are fearful."</p>
                    <footer>— Warren Buffett</footer>
                </blockquote>

                <blockquote class="quote-card" data-persona="dad">
                    <p>"The days are long, but the years are short."</p>
                    <footer>— Gretchen Rubin</footer>
                </blockquote>

                <blockquote class="quote-card">
                    <p>"First principles is kind of a physics way of looking at the world. You boil things down to the most fundamental truths and say, 'What are we sure is true?' ... and then reason up from there."</p>
                    <footer>— Elon Musk</footer>
                </blockquote>

                <blockquote class="quote-card">
                    <p>"The most important thing in communication is hearing what isn't said."</p>
                    <footer>— Peter Drucker</footer>
                </blockquote>

                <blockquote class="quote-card">
                    <p>"Culture eats strategy for breakfast."</p>
                    <footer>— Peter Drucker</footer>
                </blockquote>

                <blockquote class="quote-card">
                    <p>"If you want to go fast, go alone. If you want to go far, go together."</p>
                    <footer>— African Proverb</footer>
                </blockquote>
            </div>
        `
    },
    questions: {
        title: "Questions",
        content: `
            <div class="questions-list">
                <div class="question-card">
                    <h3 class="question-title">On Building</h3>
                    <p class="question">What would you build if you knew you couldn't fail?</p>
                    <p class="question">What problem do you personally face that nobody is solving well?</p>
                    <p class="question">If you had unlimited resources but only one year, what would you create?</p>
                </div>

                <div class="question-card">
                    <h3 class="question-title">On Leadership</h3>
                    <p class="question">What's the hardest decision you've had to make as a leader?</p>
                    <p class="question">How do you balance being liked with being effective?</p>
                    <p class="question">What's one thing you wish someone had told you before becoming a leader?</p>
                </div>

                <div class="question-card">
                    <h3 class="question-title">On Growth</h3>
                    <p class="question">What belief did you hold strongly 5 years ago that you no longer believe?</p>
                    <p class="question">What's the most valuable skill you've developed in the last year?</p>
                    <p class="question">If you could master one thing instantly, what would it be and why?</p>
                </div>

                <div class="question-card">
                    <h3 class="question-title">On Life</h3>
                    <p class="question">What would you do differently if you knew nobody would judge you?</p>
                    <p class="question">What's something you believe that most people disagree with?</p>
                    <p class="question">If you could have dinner with anyone, living or dead, who would it be and what would you ask them?</p>
                </div>

                <div class="question-card">
                    <h3 class="question-title">On Success</h3>
                    <p class="question">How do you define success for yourself?</p>
                    <p class="question">What sacrifice are you making today for a better tomorrow?</p>
                    <p class="question">What would you attempt if you knew you had only a 50% chance of success?</p>
                </div>
            </div>
        `
    },
    investments: {
        title: "Investments",
        content: `
            <div class="investment-grid">
                <div class="investment-category">
                    <h2>Unicorns 🦄</h2>
                    <ul class="investment-list">
                        <li><a href="https://rippling.com" target="_blank">Rippling</a> - Employee management platform</li>
                        <li><a href="https://deel.com" target="_blank">Deel</a> - Global payroll and compliance</li>
                        <li><a href="https://ramp.com" target="_blank">Ramp</a> - Corporate cards and expense management</li>
                        <li><a href="https://alchemy.com" target="_blank">Alchemy</a> - Blockchain developer platform</li>
                        <li><a href="https://eigenlayer.xyz" target="_blank">EigenLayer</a> - Ethereum restaking protocol</li>
                        <li><a href="https://fireblocks.com" target="_blank">Fireblocks</a> - Digital asset custody</li>
                        <li><a href="https://bitwave.io" target="_blank">Bitwave</a> - Digital asset accounting</li>
                    </ul>
                </div>

                <div class="investment-category">
                    <h2>Exits 💰</h2>
                    <ul class="investment-list">
                        <li><strong>Rio Network</strong> → EigenLayer (2023)</li>
                        <li><strong>ScaleIP</strong> → The Invention Network (2025)</li>
                        <li><strong>Multisig Media</strong> → Bitwave (2022)</li>
                        <li><strong>RADAR</strong> → Blockcap (2021)</li>
                        <li><strong>The Horse and I</strong> → The Right Horse (2016)</li>
                    </ul>
                </div>

                <div class="investment-category">
                    <h2>Active Portfolio 🚀</h2>
                    <ul class="investment-list">
                        <li><a href="https://openai.com" target="_blank">OpenAI</a> - Artificial intelligence research</li>
                        <li><a href="https://anthropic.com" target="_blank">Anthropic</a> - AI safety company</li>
                        <li><a href="https://figma.com" target="_blank">Figma</a> - Collaborative design platform</li>
                        <li><a href="https://notion.so" target="_blank">Notion</a> - Workspace and notes</li>
                        <li><a href="https://airtable.com" target="_blank">Airtable</a> - Spreadsheet database hybrid</li>
                        <li>+ 45 more companies...</li>
                    </ul>
                </div>

                <div class="investment-stats">
                    <div class="stat">
                        <span class="stat-value">50+</span>
                        <span class="stat-label">Companies</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">7</span>
                        <span class="stat-label">Unicorns</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">5</span>
                        <span class="stat-label">Exits</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">300%+</span>
                        <span class="stat-label">Lifetime IRR</span>
                    </div>
                </div>
            </div>
        `
    }
};