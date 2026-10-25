# Smart Hostel Mess Nutrition Assistant

**Live app:** _add your deployed URL here_
**Demo video:** _add link here_

## The problem
Hostel students eat what the mess serves. The menu is fixed for the month, so the choice is not *what* to cook but *how much* of each item to eat. Most calorie apps are built around packaged food or restaurant dishes and don't know that day's mess menu, so students either don't track at all or search for every dish by hand.

## Who it is for
Students living in a hostel with a fixed mess menu who want to gain muscle, lose fat or just maintain, and have a small pocket-money budget for extras such as eggs or milk.

## What it does
1. Save your details and goal. Daily calorie, protein, carb and fat targets are calculated (Mifflin-St Jeor).
2. Pick a date and meal. Only that day's mess menu is shown.
3. Enter a quantity in grams or servings.
4. See calories, protein, carbs and fats against your targets.
5. Get suggestions for the remaining protein and calories, from mess items you have not eaten yet plus cheap add-ons within your daily budget.
6. Type a free-text question (for example "I am short on protein, what should I eat for dinner?"). It is answered by the Gemini API, which is given that day's mess menu, what you have eaten so far and your targets, so answers are about the food you can actually get.
7. The monthly mess menu is shown as a table for any month. Click a day to log food for it.
8. A 7-day view shows how consistently you are hitting your calorie target.

## Run locally
Needs Node 20.12 or newer. There are no dependencies to install.
```bash
git clone <repo-url>
cd mess-nutrition-assistant
cp .env.example .env     # then put your own Gemini API key in .env
npm start
```
Open http://localhost:3000. The app, tracking and recommendations work without a key. Only the question box needs one. Get a free key from Google AI Studio. The key stays on the server in `.env` (which is git-ignored) and is never sent to the browser.

## Tests
Requires Node 20.12+. The Gemini call is tested with a mocked network request, so no key is needed to run the tests.
```bash
npm test
```
Covers unit conversion, scaling, target calculation, input validation, totals with unknown foods, the suggestion rules (budget, calorie headroom, targets met), and the question box backend (input checks, prompt building, key handling, rate-limit and error mapping). There is also a manual test plan below.

### Manual test plan
| Case | Expected |
|---|---|
| Add 1 serving of rice | Calories and protein bars update, entry appears in the log |
| Quantity 0, negative or empty | Error message, nothing logged |
| Quantity above 2000 g | Error message |
| Change date | Menu follows that weekday, log and totals switch to that date |
| Remove an entry | Totals drop immediately |
| Age 5 or weight 0 in goals | Error, goals not saved |
| Ask a question with the key set | An answer appears and mentions menu items |
| Ask with an empty or 300+ character question | Error message, no request sent for empty input |
| Run without `GEMINI_API_KEY` | Question box shows a clear message, rest of the app still works |
| Open the monthly menu and change month | Every day of that month is listed, today is highlighted |
| Click a day in the monthly menu | The date at the top switches to that day |
| Long Gemini answer | Full answer shown, or a note if it was cut short |
| Reload page | Profile and logs are still there |
| Browser with storage blocked | App still works for the session |

## Deploy
Deploy on Vercel: import the repo, leave the build command empty, and add environment variables `GEMINI_API_KEY` (required for the question box) and optionally `GEMINI_MODEL` (default `gemini-3.5-flash`). The file in `api/ask.js` runs as a serverless function automatically. A host without serverless functions (plain GitHub Pages) will show the app but the question box will not work.

## Known limitations
- Nutrition values are approximate averages per 100 g, not lab values, and real mess portions vary.
- The menu in `data/menu.js` is a sample weekly menu repeated across the month. Replace it with your college's real menu.
- Data lives in the browser's localStorage, so it is per device and there is no login.
- The question box depends on the Gemini free tier, which has rate limits. When it fails the user sees a message and the rule-based recommendations still work. There is no per-user rate limiting yet.
- Answers come from a language model and can be wrong. The prompt tells it to give general guidance only, but it is not medical advice.
- Add-on spending is not tracked, so the budget only filters which suggestions are shown.
- Targets are general estimates, not medical advice.

## Product write-up
**Problem and user.** Hostel students on a fixed mess menu who want to track nutrition without searching for every dish. Existing apps ignore the fixed menu, so logging is slow and advice is generic.

**Key decisions.**
1. *Menu-first logging.* You choose from today's actual mess menu instead of searching a food database. This is the main improvement over generic trackers.
2. *Rules for numbers, Gemini for questions.* Targets and suggestions are plain calculations, so they are instant, explainable and work offline. Free-text questions go to Gemini, which gets the day's menu and totals as context so it answers about real mess food.
3. *Key stays on the server.* The browser calls `/api/ask`, a small serverless function that adds the key. Everything else stays in the browser with localStorage, so there is no login or database to run.

**Cut from scope.** Real monthly menu upload, accounts and sync, micronutrients, tracking add-on spending, streaming answers, chat history and rate limiting. Next I would add menu upload (CSV) and a shared backend so a hostel publishes one menu for all students.

**What broke or surprised me.** Opening the page from disk failed because ES modules need a server, hence `npm start`. Dates were off by a day around midnight because `toISOString` uses UTC, so I convert with the timezone offset. Menu items can disappear from saved logs, so totals skip unknown foods. The free Gemini tier can rate-limit or fail, so errors are mapped to clear messages and the rest of the app does not depend on it.

## Attribution
No third-party libraries. Answers to the question box use the Gemini API.
