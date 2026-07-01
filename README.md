# Zapyear

Zapyear is a local web-based live wallpaper for Windows and Lively Wallpaper. It shows the current year, a GitHub-contribution-style day grid, days passed, days remaining, a subtle local date line, and a quiet progress bar with completed and remaining percentages.

The wallpaper uses only HTML, CSS, and vanilla JavaScript. It has no build step, no npm dependencies, no framework, and no internet requirement.

## Project Structure

- `index.html` is the main wallpaper file loaded by Lively Wallpaper or a browser.
- `styles.css` contains the full-screen dark visual design, responsive layout, progress bar, and current-day pulse.
- `script.js` calculates the current date, builds the yearly grid, updates the progress, and handles Lively properties.
- `LivelyInfo.backup.json` provides wallpaper metadata and points Lively to `index.html`.
- `LivelyProperties.json` defines customizable wallpaper settings.
- `README.md` explains usage and troubleshooting.

## How Date Calculation Works

Zapyear uses the viewer's local system date through `new Date()`.

- Leap years are calculated with the standard rule: divisible by 4, except centuries unless divisible by 400.
- The current year uses 365 squares in a normal year and 366 squares in a leap year.
- Days passed includes today.
- Days remaining excludes today.
- January 1 is aligned to its real local weekday, with empty leading squares when needed.
- Completed and remaining percentages are calculated from the same day counts and rounded to one decimal place.
- The page updates immediately on load and checks again every minute.
- When midnight passes, the current square and counts update without reloading.
- When a new year starts, the full calendar grid is rebuilt automatically.

## Test In A Browser

Open `index.html` directly in Chrome or Edge.

You should see:

- The current year.
- The current weekday, month, and date.
- Days passed and days remaining.
- A seven-row yearly day grid.
- A red completed percentage, progress bar, and remaining percentage.
- The current day highlighted with a white border.

## Import Into Lively Wallpaper

1. Open Lively Wallpaper.
2. Choose `Add Wallpaper`.
3. Select the `zapyear` folder or the `index.html` file.
4. Lively should read `LivelyInfo.json` and use `index.html` as the main wallpaper.
5. Apply the wallpaper to your display.

## Customize

Lively properties are defined in `LivelyProperties.json`.

Available settings:

- Accent colour.
- Show or hide motivational text.
- Enable or disable the current-day pulse.
- Adjust grid square size.
- Adjust background brightness.

The wallpaper also works outside Lively with the default values.

## Troubleshooting

If the wallpaper does not update:

- Check that your Windows date and time are correct.
- Make sure `script.js` is in the same folder as `index.html`.
- In Lively, remove and re-add the wallpaper if property changes are not reflected.
- Open `index.html` in Chrome or Edge to confirm the page works outside Lively.
- Leave the wallpaper running past midnight to verify that the current-day square moves automatically.
