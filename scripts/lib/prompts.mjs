import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export function createPrompt() {
  return readline.createInterface({ input, output });
}

export async function ask(rl, question, { defaultValue } = {}) {
  const hint = defaultValue !== undefined && defaultValue !== '' ? ` (${defaultValue})` : '';
  const answer = (await rl.question(`${question}${hint}: `)).trim();
  if (!answer && defaultValue !== undefined) return defaultValue;
  return answer;
}

export async function askRequired(rl, question, options = {}) {
  while (true) {
    const answer = await ask(rl, question, options);
    if (answer) return answer;
    console.log('  Required — please enter a value.');
  }
}

export async function askChoice(rl, question, choices, defaultChoice) {
  console.log(`\n${question}`);
  choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  while (true) {
    const raw = await ask(rl, 'Choose number', { defaultValue: String(defaultChoice ?? 1) });
    const n = parseInt(raw, 10);
    if (n >= 1 && n <= choices.length) return choices[n - 1];
    console.log('  Invalid choice.');
  }
}

export async function askYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const raw = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (!raw) return defaultYes;
  return raw === 'y' || raw === 'yes';
}
