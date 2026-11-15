import assert from 'node:assert/strict';
import test from 'node:test';
import { chordTones, findVoicings, identifyChord, playedNotes, progressionInKey, progressions, qualities } from './chords.mjs';
import { pitchClass } from './music.mjs';

test('all 216 chord recipes have playable candidates with valid pitch classes', () => {
  for (let root = 0; root < 12; root++) {
    for (const [kind, [, , intervals]] of Object.entries(qualities)) {
      const voicings = findVoicings(root, kind);
      assert.ok(voicings.length > 0);
      for (const shape of voicings) {
        assert.equal(shape.length, 6);
        const fretted = shape.filter(fret => fret > 0);
        assert.ok(!fretted.length || Math.max(...fretted) - Math.min(...fretted) <= 3);
        const played = new Set(playedNotes(shape).map(pitchClass));
        const allowed = new Set(intervals.map(interval => pitchClass(root + interval)));
        assert.ok([...played].every(pc => allowed.has(pc)));
        const required = intervals.length === 5 ? intervals.filter(interval => interval !== 7) : intervals;
        assert.ok(required.every(interval => played.has(pitchClass(root + interval))));
      }
    }
  }
});

test('recognizes chord shapes and spells tones by scale degree', () => {
  assert.deepEqual(findVoicings(0, 'major')[0], [-1, 3, 2, 0, 1, 0]);
  assert.equal(identifyChord([-1, 3, 2, 0, 1, 0])[0], 'C');
  assert.equal(identifyChord([0, 3, 2, 0, 1, 0])[0], 'C/E');
  assert.deepEqual(chordTones(1, 'major').map(tone => tone.name), ['C♯', 'E♯', 'G♯']);
});

test('progressions transpose to the requested key with valid shapes', () => {
  assert.deepEqual(progressionInKey(progressions[2], 7).map(chord => chord.label), ['Am7', 'D7', 'Gmaj7']);
  const blues = progressionInKey(progressions.at(-1), 9);
  assert.equal(blues.length, 12);
  assert.deepEqual([...new Set(blues.map(chord => chord.label))], ['A7', 'D7', 'E7']);
  for (const progression of progressions) {
    for (let root = 0; root < 12; root++) {
      assert.ok(progressionInKey(progression, root).every(chord => playedNotes(chord.frets).length >= 3));
    }
  }
});
