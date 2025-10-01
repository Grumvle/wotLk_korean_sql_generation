import { normalizeText } from '../scraper/normalize.js';

function sqlEscapeText(s) {
  if (s == null) return 'NULL';
  return "'" + String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/'/g, "\\'")
    + "'";
}
function sqlEscapeNumber(n) {
  return (n == null || isNaN(+n)) ? 0 : +n;
}

export function buildQuestUpsertSQL(id, locale, f) {
  const cols = [
    'ID','locale','Title','Details','Objectives','EndText',
    'CompletedText','ObjectiveText1','ObjectiveText2','ObjectiveText3',
    'ObjectiveText4','VerifiedBuild'
  ];

  const vals = [
    id,
    sqlEscapeText(locale),
    sqlEscapeText(normalizeText(f.Title)),
    sqlEscapeText(normalizeText(f.Details)),
    sqlEscapeText(normalizeText(f.Objectives)),
    sqlEscapeText(normalizeText(f.EndText)),
    sqlEscapeText(normalizeText(f.CompletedText)),
    sqlEscapeText(normalizeText(f.ObjectiveText1)),
    sqlEscapeText(normalizeText(f.ObjectiveText2)),
    sqlEscapeText(normalizeText(f.ObjectiveText3)),
    sqlEscapeText(normalizeText(f.ObjectiveText4)),
    sqlEscapeNumber(f.VerifiedBuild)
  ];

  const updates = [
    'Title = newrow.Title',
    'Details = newrow.Details',
    'Objectives = newrow.Objectives',
    'EndText = newrow.EndText',
    'CompletedText = newrow.CompletedText',
    'ObjectiveText1 = newrow.ObjectiveText1',
    'ObjectiveText2 = newrow.ObjectiveText2',
    'ObjectiveText3 = newrow.ObjectiveText3',
    'ObjectiveText4 = newrow.ObjectiveText4',
    'VerifiedBuild = newrow.VerifiedBuild'
  ];

  return 'INSERT INTO `quest_template_locale` (' +
    cols.map(c => '`' + c + '`').join(', ') +
    ') VALUES (' + vals.join(', ') +
    ') AS newrow ON DUPLICATE KEY UPDATE ' +
    updates.join(', ') + ';';
}
