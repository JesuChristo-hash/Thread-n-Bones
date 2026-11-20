import os
import struct
import subprocess

SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
OUT_DIR = "public/assets/audio"
TPQ = 480


def vlq(n: int) -> bytes:
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))


class MidiBuilder:
    def __init__(self, bpm: float):
        self.bpm = bpm
        self.tracks: list[list[tuple[int, int, bytes]]] = []

    def add_track(self) -> int:
        self.tracks.append([])
        return len(self.tracks) - 1

    def program(self, tr: int, ch: int, prog: int, tick: int = 0):
        self.tracks[tr].append((tick, 0, bytes([0xC0 | ch, prog])))

    def cc(self, tr: int, ch: int, ctrl: int, val: int, tick: int = 0):
        self.tracks[tr].append((tick, 1, bytes([0xB0 | ch, ctrl, val])))

    def note(self, tr: int, ch: int, pitch: int, vel: int, start_beat: float, dur_beats: float):
        s = int(round(start_beat * TPQ))
        e = int(round((start_beat + dur_beats) * TPQ))
        self.tracks[tr].append((s, 3, bytes([0x90 | ch, pitch, vel])))
        self.tracks[tr].append((e, 2, bytes([0x80 | ch, pitch, 0])))

    def write(self, path: str):
        us_per_q = int(round(60_000_000 / self.bpm))
        tempo_tr = [(0, 0, b"\xFF\x51\x03" + us_per_q.to_bytes(3, "big"))]
        all_tracks = [tempo_tr] + self.tracks

        chunks = [b"MThd" + struct.pack(">LHHH", 6, 1, len(all_tracks), TPQ)]
        for evs in all_tracks:
            evs_sorted = sorted(evs, key=lambda x: (x[0], x[1]))
            body = bytearray()
            last_t = 0
            for t, _, data in evs_sorted:
                body.extend(vlq(max(0, t - last_t)))
                body.extend(data)
                last_t = t
            body.extend(b"\x00\xFF\x2F\x00")
            chunks.append(b"MTrk" + struct.pack(">L", len(body)) + bytes(body))

        with open(path, "wb") as f:
            f.write(b"".join(chunks))


def render_seamless_ogg(mid_path: str, ogg_path: str, loop_seconds: float):
    wav_path = mid_path.replace(".mid", ".wav")
    subprocess.run(
        [
            "fluidsynth", "-ni", "-R", "1", "-C", "1",
            "-g", "0.85", "-r", "44100",
            "-F", wav_path, SF2, mid_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", wav_path,
            "-ss", f"{loop_seconds:.6f}", "-t", f"{loop_seconds:.6f}",
            "-af", "highpass=f=55,alimiter=limit=0.95",
            "-c:a", "libvorbis", "-q:a", "5",
            ogg_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    os.remove(wav_path)
    os.remove(mid_path)


def build_map_theme():
    # 16 bars @ 64 BPM = exact 60.0s loop (render 2 passes + 1 bar tail)
    bpm = 64.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_harp = m.add_track()
    t_choir = m.add_track()
    t_strings = m.add_track()
    t_oboe = m.add_track()

    # Channel setup: Harp(46), Choir Aahs(52), Slow Strings(49), Oboe(68)
    m.program(t_harp, 0, 46);    m.cc(t_harp, 0, 7, 102);   m.cc(t_harp, 0, 91, 112); m.cc(t_harp, 0, 10, 56)
    m.program(t_choir, 1, 52);   m.cc(t_choir, 1, 7, 74);   m.cc(t_choir, 1, 91, 122); m.cc(t_choir, 1, 10, 64)
    m.program(t_strings, 2, 49); m.cc(t_strings, 2, 7, 78); m.cc(t_strings, 2, 91, 118); m.cc(t_strings, 2, 10, 72)
    m.program(t_oboe, 3, 68);    m.cc(t_oboe, 3, 7, 82);    m.cc(t_oboe, 3, 91, 118); m.cc(t_oboe, 3, 10, 60)

    # 8 chords x 2 bars (8 beats each) = 64 beats
    chords = [
        # (bass, harp_arp, choir_pad, string_bed)
        (38, [50, 57, 62, 64, 65, 64, 62, 57], [62, 65, 69], [50, 57, 62]),  # Dm9
        (46, [46, 53, 57, 62, 65, 62, 57, 53], [62, 65, 69], [46, 53, 57]),  # Bbmaj7
        (48, [48, 55, 57, 64, 67, 64, 57, 55], [60, 64, 67], [48, 55, 60]),  # C6
        (45, [45, 52, 55, 60, 64, 60, 55, 52], [60, 64, 69], [45, 52, 57]),  # Am7
        (43, [43, 50, 55, 57, 58, 57, 55, 50], [62, 67, 70], [43, 50, 58]),  # Gm9
        (41, [41, 48, 53, 57, 62, 57, 53, 48], [60, 65, 69], [41, 48, 57]),  # Dm7/F
        (39, [39, 46, 55, 58, 62, 58, 55, 46], [58, 62, 67], [39, 46, 55]),  # Ebmaj7 (Phrygian lift)
        (45, [45, 52, 57, 62, 64, 62, 57, 52], [62, 64, 69], [45, 52, 62]),  # Asus4
    ]

    # Sparse oboe lament: (beat_offset, pitch, dur, vel)
    oboe_melody = [
        (16.0, 69, 3.0, 68), (19.0, 67, 1.0, 62), (20.0, 64, 3.5, 64),
        (26.0, 67, 2.0, 64), (28.0, 64, 3.5, 60),
        (34.0, 70, 2.5, 70), (36.5, 69, 1.5, 64), (38.0, 67, 2.0, 62), (40.0, 65, 3.5, 64),
        (48.0, 67, 2.0, 66), (50.0, 65, 2.0, 64), (52.0, 62, 3.5, 62),
        (56.0, 64, 4.5, 66),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, arp, choir, strings) in enumerate(chords):
            b0 = base + idx * 8.0
            # Harp rolling 8th-note figure with gentle breathing gap on bar 2 end
            for step, pitch in enumerate(arp):
                vel = 68 - (step % 4) * 5
                m.note(t_harp, 0, pitch, vel, b0 + step * 0.75, 2.2)
            # Soft echo pluck on bar 2
            m.note(t_harp, 0, arp[2], 54, b0 + 6.0, 2.2)
            m.note(t_harp, 0, arp[4], 48, b0 + 6.75, 1.8)

            # Choir enters gently on every chord
            for cp in choir:
                m.note(t_choir, 1, cp, 56 if idx < 4 else 66, b0 + 0.25, 7.6)

            # Strings swell in second half, gentle cello drone throughout
            m.note(t_strings, 2, bass, 62, b0, 7.9)
            if idx >= 4:
                for sp in strings:
                    m.note(t_strings, 2, sp, 64, b0, 7.9)

        for beat, pitch, dur, vel in oboe_melody:
            m.note(t_oboe, 3, pitch, vel, base + beat, dur)

    # Keep MIDI alive briefly after pass 2 so FluidSynth doesn't clip early
    m.note(t_harp, 0, 50, 1, loop_beats * 2 + 2.0, 1.0)

    mid = "/tmp/map_theme.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "map_theme.ogg"), loop_beats * (60.0 / bpm))


def build_duel_theme():
    # 16 bars @ 96 BPM = exact 40.0s loop
    bpm = 96.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_rhodes = m.add_track()
    t_piano = m.add_track()
    t_pad = m.add_track()
    t_bass = m.add_track()
    t_perc = m.add_track()

    # Rhodes(4), Acoustic Piano(0), Warm Pad(89), Cello/Strings(48), Perc(ch 9)
    m.program(t_rhodes, 0, 4);  m.cc(t_rhodes, 0, 7, 94);  m.cc(t_rhodes, 0, 91, 92);  m.cc(t_rhodes, 0, 93, 45); m.cc(t_rhodes, 0, 10, 52)
    m.program(t_piano, 1, 0);   m.cc(t_piano, 1, 7, 92);   m.cc(t_piano, 1, 91, 104); m.cc(t_piano, 1, 10, 72)
    m.program(t_pad, 2, 89);    m.cc(t_pad, 2, 7, 66);     m.cc(t_pad, 2, 91, 114);   m.cc(t_pad, 2, 10, 64)
    m.program(t_bass, 3, 48);   m.cc(t_bass, 3, 7, 74);    m.cc(t_bass, 3, 91, 88);    m.cc(t_bass, 3, 10, 64)
    m.cc(t_perc, 9, 7, 62);     m.cc(t_perc, 9, 91, 64)

    # 8 chords x 2 bars (8 beats each) in F# minor / A major liminal
    chords = [
        # (bass, rhodes_8th_pattern, pad_voicing)
        (42, [54, 61, 68, 69, 61, 68, 64, 61], [54, 61, 64, 68]),  # F#m9
        (38, [50, 57, 61, 66, 57, 61, 64, 57], [50, 57, 61, 66]),  # Dmaj7
        (47, [47, 54, 61, 62, 54, 61, 59, 54], [47, 54, 59, 61]),  # Bm9
        (49, [49, 56, 59, 64, 56, 59, 61, 56], [49, 56, 59, 64]),  # C#m7
        (50, [50, 57, 61, 66, 61, 64, 66, 61], [50, 57, 61, 66]),  # Dmaj7
        (52, [52, 59, 61, 68, 59, 61, 64, 59], [52, 59, 61, 68]),  # E6
        (42, [54, 59, 61, 64, 59, 61, 66, 61], [54, 59, 61, 64]),  # F#m11
        (49, [49, 56, 59, 64, 59, 61, 64, 59], [49, 56, 59, 64]),  # C#m7
    ]

    # Wistful Shimomura-style upper piano line
    piano_melody = [
        (4.0, 73, 1.5, 74), (5.5, 71, 0.5, 66), (6.0, 69, 2.0, 70),
        (10.0, 68, 1.5, 68), (11.5, 69, 0.5, 64), (12.0, 73, 3.0, 72),
        (20.0, 74, 1.5, 74), (21.5, 73, 0.5, 68), (22.0, 71, 2.0, 70),
        (26.0, 68, 1.5, 68), (27.5, 69, 1.0, 64), (28.5, 71, 2.5, 68),
        (34.0, 76, 1.5, 76), (35.5, 73, 1.0, 70), (36.5, 71, 1.5, 68),
        (40.0, 73, 2.0, 74), (42.0, 71, 1.0, 68), (43.0, 68, 3.0, 70),
        (48.0, 69, 1.5, 72), (49.5, 71, 1.5, 70), (51.0, 73, 2.5, 74),
        (56.0, 71, 1.5, 68), (57.5, 68, 2.5, 64),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, arp, pad) in enumerate(chords):
            b0 = base + idx * 8.0
            # Continuous shimmering 8th-note Rhodes arpeggio (2 bars = 16 eighth notes)
            for step in range(16):
                pitch = arp[step % len(arp)]
                vel = 72 if step % 4 == 0 else (58 if step % 2 == 0 else 48)
                m.note(t_rhodes, 0, pitch, vel, b0 + step * 0.5, 0.85)

            # Warm pad + midrange cello root (octave doubled softly for small speakers)
            for pp in pad:
                m.note(t_pad, 2, pp, 52, b0, 7.9)
            m.note(t_bass, 3, bass, 58, b0, 7.8)
            m.note(t_bass, 3, bass + 12, 46, b0, 7.8)

            # Tight, muted Cavern-style rhythmic tick across 2 bars
            for beat in range(8):
                bt = b0 + beat
                m.note(t_perc, 9, 42, 46 if beat % 2 == 0 else 34, bt, 0.2)         # soft closed hat
                m.note(t_perc, 9, 82, 32, bt + 0.5, 0.2)                            # shaker offbeat
                if beat in (0, 3, 6):
                    m.note(t_perc, 9, 77, 42, bt, 0.2)                              # low woodblock pulse
                if beat in (2, 6):
                    m.note(t_perc, 9, 37, 48, bt, 0.2)                              # muted side-stick

        for beat, pitch, dur, vel in piano_melody:
            m.note(t_piano, 1, pitch, vel, base + beat, dur)

    m.note(t_rhodes, 0, 54, 1, loop_beats * 2 + 2.0, 1.0)

    mid = "/tmp/duel_theme.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "duel_theme.ogg"), loop_beats * (60.0 / bpm))


if __name__ == "__main__":
    build_map_theme()
    build_duel_theme()
    print("Generated map_theme.ogg and duel_theme.ogg in public/assets/audio/")
