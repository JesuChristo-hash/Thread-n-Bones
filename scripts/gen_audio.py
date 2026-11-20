import os
import struct
import subprocess
import sys

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
        self.tracks[tr].append((tick, 0, bytes([0xC0 | ch, prog & 0x7F])))

    def cc(self, tr: int, ch: int, ctrl: int, val: int, tick: int = 0):
        self.tracks[tr].append((tick, 1, bytes([0xB0 | ch, ctrl & 0x7F, max(0, min(127, val))])))

    def note(self, tr: int, ch: int, pitch: int, vel: int, start_beat: float, dur_beats: float):
        p = max(0, min(127, int(pitch)))
        v = max(1, min(127, int(vel)))
        s = int(round(start_beat * TPQ))
        e = int(round((start_beat + dur_beats) * TPQ))
        self.tracks[tr].append((s, 3, bytes([0x90 | ch, p, v])))
        self.tracks[tr].append((e, 2, bytes([0x80 | ch, p, 0])))

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


def render_seamless_ogg(mid_path: str, ogg_path: str, loop_seconds: float, gain: str = "0.85"):
    wav_path = mid_path.replace(".mid", ".wav")
    subprocess.run(
        [
            "fluidsynth", "-ni", "-R", "1", "-C", "1",
            "-g", gain, "-r", "44100",
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
    bpm = 64.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_harp = m.add_track()
    t_choir = m.add_track()
    t_strings = m.add_track()
    t_oboe = m.add_track()

    m.program(t_harp, 0, 46);    m.cc(t_harp, 0, 7, 102);   m.cc(t_harp, 0, 91, 112); m.cc(t_harp, 0, 10, 56)
    m.program(t_choir, 1, 52);   m.cc(t_choir, 1, 7, 74);   m.cc(t_choir, 1, 91, 122); m.cc(t_choir, 1, 10, 64)
    m.program(t_strings, 2, 49); m.cc(t_strings, 2, 7, 78); m.cc(t_strings, 2, 91, 118); m.cc(t_strings, 2, 10, 72)
    m.program(t_oboe, 3, 68);    m.cc(t_oboe, 3, 7, 82);    m.cc(t_oboe, 3, 91, 118); m.cc(t_oboe, 3, 10, 60)

    chords = [
        (38, [50, 57, 62, 64, 65, 64, 62, 57], [62, 65, 69], [50, 57, 62]),
        (46, [46, 53, 57, 62, 65, 62, 57, 53], [62, 65, 69], [46, 53, 57]),
        (48, [48, 55, 57, 64, 67, 64, 57, 55], [60, 64, 67], [48, 55, 60]),
        (45, [45, 52, 55, 60, 64, 60, 55, 52], [60, 64, 69], [45, 52, 57]),
        (43, [43, 50, 55, 57, 58, 57, 55, 50], [62, 67, 70], [43, 50, 58]),
        (41, [41, 48, 53, 57, 62, 57, 53, 48], [60, 65, 69], [41, 48, 57]),
        (39, [39, 46, 55, 58, 62, 58, 55, 46], [58, 62, 67], [39, 46, 55]),
        (45, [45, 52, 57, 62, 64, 62, 57, 52], [62, 64, 69], [45, 52, 62]),
    ]

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
            for step, pitch in enumerate(arp):
                vel = 68 - (step % 4) * 5
                m.note(t_harp, 0, pitch, vel, b0 + step * 0.75, 2.2)
            m.note(t_harp, 0, arp[2], 54, b0 + 6.0, 2.2)
            m.note(t_harp, 0, arp[4], 48, b0 + 6.75, 1.8)
            for cp in choir:
                m.note(t_choir, 1, cp, 56 if idx < 4 else 66, b0 + 0.25, 7.6)
            m.note(t_strings, 2, bass, 62, b0, 7.9)
            if idx >= 4:
                for sp in strings:
                    m.note(t_strings, 2, sp, 64, b0, 7.9)
        for beat, pitch, dur, vel in oboe_melody:
            m.note(t_oboe, 3, pitch, vel, base + beat, dur)

    m.note(t_harp, 0, 50, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/map_theme.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "map_theme.ogg"), loop_beats * (60.0 / bpm))


def build_duel_theme():
    bpm = 96.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_rhodes = m.add_track()
    t_piano = m.add_track()
    t_pad = m.add_track()
    t_bass = m.add_track()
    t_perc = m.add_track()

    m.program(t_rhodes, 0, 4);  m.cc(t_rhodes, 0, 7, 94);  m.cc(t_rhodes, 0, 91, 92);  m.cc(t_rhodes, 0, 93, 45); m.cc(t_rhodes, 0, 10, 52)
    m.program(t_piano, 1, 0);   m.cc(t_piano, 1, 7, 92);   m.cc(t_piano, 1, 91, 104); m.cc(t_piano, 1, 10, 72)
    m.program(t_pad, 2, 89);    m.cc(t_pad, 2, 7, 66);     m.cc(t_pad, 2, 91, 114);   m.cc(t_pad, 2, 10, 64)
    m.program(t_bass, 3, 48);   m.cc(t_bass, 3, 7, 74);    m.cc(t_bass, 3, 91, 88);    m.cc(t_bass, 3, 10, 64)
    m.cc(t_perc, 9, 7, 62);     m.cc(t_perc, 9, 91, 64)

    chords = [
        (42, [54, 61, 68, 69, 61, 68, 64, 61], [54, 61, 64, 68]),
        (38, [50, 57, 61, 66, 57, 61, 64, 57], [50, 57, 61, 66]),
        (47, [47, 54, 61, 62, 54, 61, 59, 54], [47, 54, 59, 61]),
        (49, [49, 56, 59, 64, 56, 59, 61, 56], [49, 56, 59, 64]),
        (50, [50, 57, 61, 66, 61, 64, 66, 61], [50, 57, 61, 66]),
        (52, [52, 59, 61, 68, 59, 61, 64, 59], [52, 59, 61, 68]),
        (42, [54, 59, 61, 64, 59, 61, 66, 61], [54, 59, 61, 64]),
        (49, [49, 56, 59, 64, 59, 61, 64, 59], [49, 56, 59, 64]),
    ]

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
            for step in range(16):
                pitch = arp[step % len(arp)]
                vel = 72 if step % 4 == 0 else (58 if step % 2 == 0 else 48)
                m.note(t_rhodes, 0, pitch, vel, b0 + step * 0.5, 0.85)
            for pp in pad:
                m.note(t_pad, 2, pp, 52, b0, 7.9)
            m.note(t_bass, 3, bass, 58, b0, 7.8)
            m.note(t_bass, 3, bass + 12, 46, b0, 7.8)
            for beat in range(8):
                bt = b0 + beat
                m.note(t_perc, 9, 42, 46 if beat % 2 == 0 else 34, bt, 0.2)
                m.note(t_perc, 9, 82, 32, bt + 0.5, 0.2)
                if beat in (0, 3, 6):
                    m.note(t_perc, 9, 77, 42, bt, 0.2)
                if beat in (2, 6):
                    m.note(t_perc, 9, 37, 48, bt, 0.2)
        for beat, pitch, dur, vel in piano_melody:
            m.note(t_piano, 1, pitch, vel, base + beat, dur)

    m.note(t_rhodes, 0, 54, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/duel_theme.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "duel_theme.ogg"), loop_beats * (60.0 / bpm))


def build_boss_weaver():
    # 24 bars of 3/4 @ 108 BPM = exact 40.0s loop (taut gothic loom waltz in E minor)
    bpm = 108.0
    loop_beats = 72.0
    m = MidiBuilder(bpm)

    t_pizz = m.add_track()
    t_harp = m.add_track()
    t_str = m.add_track()
    t_vln = m.add_track()
    t_perc = m.add_track()

    # Pizzicato(45), Harpsichord(6), Slow Strings(49), Solo Violin(40), Perc(9)
    m.program(t_pizz, 0, 45); m.cc(t_pizz, 0, 7, 98);  m.cc(t_pizz, 0, 91, 96);  m.cc(t_pizz, 0, 10, 52)
    m.program(t_harp, 1, 6);  m.cc(t_harp, 1, 7, 74);  m.cc(t_harp, 1, 91, 102); m.cc(t_harp, 1, 10, 76)
    m.program(t_str, 2, 49);  m.cc(t_str, 2, 7, 72);   m.cc(t_str, 2, 91, 114);  m.cc(t_str, 2, 10, 64)
    m.program(t_vln, 3, 40);  m.cc(t_vln, 3, 7, 88);   m.cc(t_vln, 3, 91, 112);  m.cc(t_vln, 3, 10, 58)
    m.cc(t_perc, 9, 7, 64);   m.cc(t_perc, 9, 91, 72)

    # 12 chords x 2 bars of 3/4 (6 beats each) = 72 beats
    chords = [
        (40, [52, 55, 59], [52, 59, 64, 67, 64, 59]),  # Em
        (48, [52, 55, 60], [48, 55, 60, 64, 60, 55]),  # Cmaj7
        (45, [52, 57, 60], [52, 57, 60, 64, 60, 57]),  # Am
        (47, [51, 54, 59], [47, 54, 59, 63, 59, 54]),  # B7
        (40, [52, 55, 59], [52, 59, 64, 67, 66, 64]),  # Em
        (43, [50, 55, 59], [50, 55, 59, 62, 59, 55]),  # G
        (42, [52, 57, 60], [50, 57, 60, 66, 60, 57]),  # F#m7b5
        (47, [51, 54, 57], [47, 54, 57, 63, 59, 54]),  # B7
        # B-section (4 chords, sharper harmonic pull)
        (48, [55, 60, 64], [55, 60, 64, 67, 64, 60]),  # C
        (45, [52, 57, 60], [52, 57, 60, 66, 60, 57]),  # Am6
        (47, [51, 57, 59], [51, 57, 59, 66, 63, 59]),  # B7
        (47, [51, 54, 59], [47, 51, 54, 59, 63, 66]),  # B7 turnaround
    ]

    violin_melody = [
        (6.0, 71, 2.0, 74), (8.0, 72, 1.0, 70), (9.0, 71, 2.5, 72),
        (12.0, 69, 2.0, 72), (14.0, 67, 1.0, 68), (15.0, 66, 2.5, 70),
        (18.0, 67, 1.5, 72), (19.5, 66, 1.5, 68), (21.0, 63, 2.5, 74),
        (24.0, 64, 2.0, 76), (26.0, 67, 1.0, 72), (27.0, 71, 2.5, 78),
        (30.0, 74, 2.0, 78), (32.0, 72, 1.0, 74), (33.0, 71, 2.5, 74),
        (36.0, 69, 2.0, 74), (38.0, 72, 1.0, 76), (39.0, 71, 2.0, 74), (41.0, 69, 1.0, 70),
        (42.0, 66, 3.0, 76), (45.0, 63, 2.5, 72),
        # B-section climb
        (48.0, 76, 2.0, 82), (50.0, 74, 1.0, 76), (51.0, 72, 2.5, 78),
        (54.0, 76, 1.5, 80), (55.5, 74, 1.5, 76), (57.0, 72, 2.5, 76),
        (60.0, 75, 2.5, 84), (62.5, 76, 0.5, 78), (63.0, 75, 2.5, 80),
        (66.0, 78, 2.0, 84), (68.0, 75, 1.0, 78), (69.0, 71, 2.5, 76),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, triad, harp_pat) in enumerate(chords):
            b0 = base + idx * 6.0
            # Two bars of 3/4 waltz pizzicato (Oom-pah-pah)
            for bar in range(2):
                bb = b0 + bar * 3.0
                m.note(t_pizz, 0, bass, 84, bb, 0.45)
                m.note(t_pizz, 0, bass + 12, 66, bb, 0.45)
                for n in triad:
                    m.note(t_pizz, 0, n, 64, bb + 1.0, 0.35)
                    m.note(t_pizz, 0, n, 58, bb + 2.0, 0.35)
                # Loom-shuttle percussion
                m.note(t_perc, 9, 77, 52, bb, 0.15)
                m.note(t_perc, 9, 76, 44, bb + 1.5, 0.15)
                m.note(t_perc, 9, 37, 56, bb + 2.0, 0.15)
                m.note(t_perc, 9, 82, 34, bb + 0.5, 0.15)
                m.note(t_perc, 9, 82, 34, bb + 2.5, 0.15)

            # Harpsichord weaving 8th notes across 6 beats
            for step in range(12):
                pitch = harp_pat[step % len(harp_pat)]
                vel = 62 if step % 3 == 0 else 48
                m.note(t_harp, 1, pitch, vel, b0 + step * 0.5, 0.48)

            # Sustained string bed
            m.note(t_str, 2, bass, 60, b0, 5.9)
            for n in triad:
                m.note(t_str, 2, n, 54 if idx < 8 else 64, b0, 5.9)

        for beat, pitch, dur, vel in violin_melody:
            m.note(t_vln, 3, pitch, vel, base + beat, dur)

    m.note(t_pizz, 0, 52, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/boss_weaver.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "boss_weaver.ogg"), loop_beats * (60.0 / bpm))


def build_boss_zealot():
    # 16 bars of 4/4 @ 120 BPM = exact 32.0s loop (martial SotC brass + organ + timpani in C minor)
    bpm = 120.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_str = m.add_track()
    t_horn = m.add_track()
    t_organ = m.add_track()
    t_choir = m.add_track()
    t_timp = m.add_track()
    t_perc = m.add_track()

    # Strings(48), French Horn(60), Church Organ(19), Choir Aahs(52), Timpani(47), Perc(9)
    m.program(t_str, 0, 48);   m.cc(t_str, 0, 7, 94);   m.cc(t_str, 0, 91, 96);  m.cc(t_str, 0, 10, 56)
    m.program(t_horn, 1, 60);  m.cc(t_horn, 1, 7, 96);  m.cc(t_horn, 1, 91, 108); m.cc(t_horn, 1, 10, 72)
    m.program(t_organ, 2, 19); m.cc(t_organ, 2, 7, 76); m.cc(t_organ, 2, 91, 112); m.cc(t_organ, 2, 10, 64)
    m.program(t_choir, 3, 52); m.cc(t_choir, 3, 7, 78); m.cc(t_choir, 3, 91, 118); m.cc(t_choir, 3, 10, 64)
    m.program(t_timp, 4, 47);  m.cc(t_timp, 4, 7, 96);  m.cc(t_timp, 4, 91, 92);  m.cc(t_timp, 4, 10, 60)
    m.cc(t_perc, 9, 7, 68);    m.cc(t_perc, 9, 91, 74)

    # 8 chords x 2 bars (8 beats each) = 64 beats in C Phrygian / minor
    chords = [
        (36, [48, 55, 60, 63], [60, 63, 67]),  # Cm
        (37, [49, 56, 61, 65], [61, 65, 68]),  # Db (Phrygian fanfare)
        (39, [51, 55, 58, 63], [58, 63, 67]),  # Eb
        (43, [47, 55, 59, 62], [59, 62, 67]),  # G
        (44, [48, 56, 60, 63], [60, 63, 68]),  # Ab
        (41, [48, 53, 56, 60], [60, 65, 68]),  # Fm
        (37, [49, 56, 61, 65], [61, 65, 68]),  # Db
        (43, [47, 53, 55, 62], [59, 62, 67]),  # G7
    ]

    horn_call = [
        (0.0, 60, 1.5, 86), (1.5, 67, 2.5, 92), (4.0, 63, 1.5, 84), (5.5, 62, 2.0, 82),
        (8.0, 61, 3.0, 90), (11.0, 60, 1.0, 80), (12.0, 56, 3.5, 84),
        (16.0, 58, 1.5, 84), (17.5, 63, 2.5, 90), (20.0, 67, 2.0, 92), (22.0, 65, 1.5, 84),
        (24.0, 62, 3.0, 92), (27.0, 63, 1.0, 84), (28.0, 67, 3.5, 94),
        (32.0, 68, 2.0, 94), (34.0, 67, 1.0, 88), (35.0, 63, 2.5, 86), (38.0, 60, 1.5, 82),
        (40.0, 65, 2.0, 92), (42.0, 63, 1.0, 86), (43.0, 60, 2.5, 84), (46.0, 61, 1.5, 84),
        (48.0, 65, 3.0, 94), (51.0, 68, 1.0, 92), (52.0, 67, 3.5, 90),
        (56.0, 67, 2.0, 96), (58.0, 65, 1.0, 88), (59.0, 62, 2.5, 90), (62.0, 59, 1.5, 86),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, org, choir) in enumerate(chords):
            b0 = base + idx * 8.0
            # Driving martial 8th-note string ostinato (accent on 1, 2.5, 4)
            ost_notes = [bass + 12, bass + 19, bass + 12, org[1], bass + 12, bass + 19, org[2], bass + 19]
            for step in range(16):
                vel = 82 if step % 4 == 0 else (72 if step % 4 == 2 else 58)
                m.note(t_str, 0, ost_notes[step % 8], vel, b0 + step * 0.5, 0.36)

            # Heavy church organ block chords
            m.note(t_organ, 2, bass, 74, b0, 7.8)
            for n in org:
                m.note(t_organ, 2, n, 66, b0, 7.8)

            # Choir enters hard in second half
            if idx >= 4 or idx in (1, 3):
                for cp in choir:
                    m.note(t_choir, 3, cp, 70 if idx >= 4 else 56, b0, 7.8)

            # Martial timpani + snare pattern across 2 bars
            for bar in range(2):
                bb = b0 + bar * 4.0
                m.note(t_timp, 4, bass, 92, bb, 0.6)
                m.note(t_timp, 4, bass, 76, bb + 1.5, 0.5)
                m.note(t_timp, 4, bass, 84, bb + 2.5, 0.5)
                if bar == 1:
                    m.note(t_timp, 4, bass, 80, bb + 3.5, 0.4)
                m.note(t_perc, 9, 38, 56, bb + 1.0, 0.2)
                m.note(t_perc, 9, 38, 66, bb + 3.0, 0.2)
                m.note(t_perc, 9, 37, 50, bb + 2.0, 0.2)

        for beat, pitch, dur, vel in horn_call:
            m.note(t_horn, 1, pitch, vel, base + beat, dur)

    m.note(t_organ, 2, 48, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/boss_zealot.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "boss_zealot.ogg"), loop_beats * (60.0 / bpm))


def build_boss_begotten():
    # 16 bars of 4/4 @ 80 BPM = exact 48.0s loop (heavy, submerged, tragic B minor)
    bpm = 80.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_cello = m.add_track()
    t_bsn = m.add_track()
    t_oohs = m.add_track()
    t_rhodes = m.add_track()
    t_bells = m.add_track()
    t_timp = m.add_track()

    # Cello(42), Bassoon(70), Voice Oohs(53), Rhodes(4), Tubular Bells(14), Timpani(47)
    m.program(t_cello, 0, 42);  m.cc(t_cello, 0, 7, 94);  m.cc(t_cello, 0, 91, 114); m.cc(t_cello, 0, 10, 56)
    m.program(t_bsn, 1, 70);    m.cc(t_bsn, 1, 7, 88);    m.cc(t_bsn, 1, 91, 112);   m.cc(t_bsn, 1, 10, 68)
    m.program(t_oohs, 2, 53);   m.cc(t_oohs, 2, 7, 76);   m.cc(t_oohs, 2, 91, 124);  m.cc(t_oohs, 2, 10, 64)
    m.program(t_rhodes, 3, 4);  m.cc(t_rhodes, 3, 7, 74); m.cc(t_rhodes, 3, 91, 116); m.cc(t_rhodes, 3, 93, 60); m.cc(t_rhodes, 3, 10, 50)
    m.program(t_bells, 4, 14);  m.cc(t_bells, 4, 7, 68);  m.cc(t_bells, 4, 91, 122); m.cc(t_bells, 4, 10, 78)
    m.program(t_timp, 5, 47);   m.cc(t_timp, 5, 7, 86);   m.cc(t_timp, 5, 91, 110);  m.cc(t_timp, 5, 10, 64)

    # 8 chords x 2 bars (8 beats each) = 64 beats in B minor / eerie Lydian-Phrygian drift
    chords = [
        (35, [47, 54, 59], [59, 62, 66], [61, 66, 71, 62]),  # Bm9
        (43, [43, 50, 55], [59, 61, 66], [61, 66, 67, 59]),  # Gmaj7#11
        (40, [40, 47, 55], [55, 59, 66], [62, 66, 67, 59]),  # Em9
        (42, [42, 49, 54], [58, 61, 64], [58, 61, 64, 66]),  # F#7
        (36, [48, 55, 59], [59, 64, 67], [60, 64, 67, 71]),  # Cmaj7 (Neapolitan sink)
        (45, [45, 52, 57], [57, 60, 64], [59, 64, 67, 60]),  # Am9
        (42, [42, 48, 54], [57, 60, 64], [57, 60, 64, 66]),  # F#m7b5
        (42, [42, 49, 54], [58, 61, 66], [58, 61, 66, 61]),  # F#7
    ]

    bassoon_lament = [
        (4.0, 59, 2.5, 74), (6.5, 61, 1.5, 70), (8.0, 62, 3.0, 76), (11.0, 61, 1.0, 68), (12.0, 59, 3.5, 72),
        (20.0, 55, 2.0, 74), (22.0, 59, 2.0, 72), (24.0, 58, 3.5, 76), (28.0, 54, 3.0, 70),
        (34.0, 60, 2.5, 78), (36.5, 59, 1.5, 72), (38.0, 55, 2.0, 70), (40.0, 57, 3.5, 74),
        (48.0, 60, 2.5, 76), (50.5, 57, 1.5, 72), (52.0, 54, 3.5, 72),
        (56.0, 58, 3.0, 78), (59.0, 61, 2.0, 74), (61.0, 58, 2.5, 70),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, cello_voicing, oohs, rhodes_drops) in enumerate(chords):
            b0 = base + idx * 8.0
            # Slow dragging cello drone + midrange 5th
            for n in cello_voicing:
                m.note(t_cello, 0, n, 72, b0, 7.9)
            # Submerged hollow choir oohs
            for n in oohs:
                m.note(t_oohs, 2, n, 58 if idx < 4 else 68, b0 + 0.5, 7.2)
            # Murky wet Rhodes drops on uneven offbeats
            for j, rp in enumerate(rhodes_drops):
                m.note(t_rhodes, 3, rp, 62 - j * 4, b0 + j * 1.75 + 0.5, 2.4)
            # Distant tubular bell toll every 2 chords
            if idx % 2 == 0:
                m.note(t_bells, 4, bass + 24, 68, b0, 4.5)
            # Heavy lurching timpani heartbeat (beat 1, beat 3.5, beat 5)
            m.note(t_timp, 5, bass, 84, b0, 1.0)
            m.note(t_timp, 5, bass, 62, b0 + 3.5, 0.8)
            m.note(t_timp, 5, bass, 74, b0 + 5.0, 1.0)

        for beat, pitch, dur, vel in bassoon_lament:
            m.note(t_bsn, 1, pitch, vel, base + beat, dur)

    m.note(t_cello, 0, 47, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/boss_begotten.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "boss_begotten.ogg"), loop_beats * (60.0 / bpm))


def build_boss_bonelord():
    # 16 bars of 4/4 @ 84 BPM = 45.714s loop (monumental cathedral doom in D minor, echoing Map key)
    bpm = 84.0
    loop_beats = 64.0
    m = MidiBuilder(bpm)

    t_organ = m.add_track()
    t_choir = m.add_track()
    t_str = m.add_track()
    t_horn = m.add_track()
    t_bells = m.add_track()
    t_timp = m.add_track()
    t_perc = m.add_track()

    m.program(t_organ, 0, 19); m.cc(t_organ, 0, 7, 94); m.cc(t_organ, 0, 91, 118); m.cc(t_organ, 0, 10, 64)
    m.program(t_choir, 1, 52); m.cc(t_choir, 1, 7, 86); m.cc(t_choir, 1, 91, 124); m.cc(t_choir, 1, 10, 64)
    m.program(t_str, 2, 48);   m.cc(t_str, 2, 7, 82);   m.cc(t_str, 2, 91, 112);   m.cc(t_str, 2, 10, 52)
    m.program(t_horn, 3, 60);  m.cc(t_horn, 3, 7, 92);  m.cc(t_horn, 3, 91, 112);  m.cc(t_horn, 3, 10, 74)
    m.program(t_bells, 4, 14); m.cc(t_bells, 4, 7, 78); m.cc(t_bells, 4, 91, 122); m.cc(t_bells, 4, 10, 48)
    m.program(t_timp, 5, 47);  m.cc(t_timp, 5, 7, 96);  m.cc(t_timp, 5, 91, 102);  m.cc(t_timp, 5, 10, 64)
    m.cc(t_perc, 9, 7, 68);    m.cc(t_perc, 9, 91, 82)

    # 8 chords x 2 bars (8 beats each) = 64 beats in D minor
    chords = [
        (38, [50, 57, 62, 65], [62, 65, 69]),  # Dm
        (46, [46, 53, 58, 62], [62, 65, 70]),  # Bb
        (43, [43, 50, 55, 58], [58, 62, 67]),  # Gm
        (45, [45, 52, 57, 61], [61, 64, 69]),  # A
        (41, [41, 50, 57, 62], [62, 65, 69]),  # Dm/F
        (39, [39, 46, 55, 58], [58, 62, 67]),  # Eb (Phrygian dread)
        (43, [43, 52, 55, 58], [58, 64, 67]),  # Gm6
        (45, [45, 52, 55, 61], [61, 64, 67]),  # A7
    ]

    horn_dirge = [
        (0.0, 62, 3.0, 86), (3.0, 65, 1.0, 82), (4.0, 64, 3.5, 84),
        (8.0, 62, 2.0, 86), (10.0, 58, 2.0, 82), (12.0, 57, 3.5, 84),
        (16.0, 58, 2.5, 84), (18.5, 62, 1.5, 86), (20.0, 67, 3.5, 92),
        (24.0, 64, 3.0, 90), (27.0, 61, 1.0, 82), (28.0, 57, 3.5, 84),
        (32.0, 69, 3.0, 94), (35.0, 67, 1.0, 88), (36.0, 65, 3.5, 90),
        (40.0, 67, 2.5, 92), (42.5, 65, 1.5, 86), (44.0, 62, 3.5, 88),
        (48.0, 64, 2.5, 90), (50.5, 62, 1.5, 84), (52.0, 58, 3.5, 86),
        (56.0, 61, 3.5, 92), (59.5, 64, 1.5, 88), (61.0, 61, 2.5, 84),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, org, choir) in enumerate(chords):
            b0 = base + idx * 8.0
            # Monumental pipe organ + choir
            m.note(t_organ, 0, bass, 84, b0, 7.8)
            for n in org:
                m.note(t_organ, 0, n, 76, b0, 7.8)
            for cp in choir:
                m.note(t_choir, 1, cp, 72 if idx < 4 else 84, b0, 7.8)

            # Heavy pulsing quarter-note strings
            for beat in range(8):
                vel = 78 if beat % 2 == 0 else 64
                m.note(t_str, 2, bass + 12, vel, b0 + beat, 0.85)
                m.note(t_str, 2, org[1], vel - 8, b0 + beat, 0.85)

            # Cathedral bell on downbeat of each chord
            m.note(t_bells, 4, bass + 24, 76, b0, 4.0)

            # Doom timpani + dry bone-click cadence
            for bar in range(2):
                bb = b0 + bar * 4.0
                m.note(t_timp, 5, bass, 94, bb, 0.9)
                m.note(t_timp, 5, bass, 78, bb + 2.5, 0.7)
                m.note(t_perc, 9, 77, 56, bb + 1.0, 0.15)
                m.note(t_perc, 9, 76, 52, bb + 2.0, 0.15)
                m.note(t_perc, 9, 37, 62, bb + 3.0, 0.15)
                if bar == 1:
                    m.note(t_perc, 9, 76, 58, bb + 3.5, 0.15)

        for beat, pitch, dur, vel in horn_dirge:
            m.note(t_horn, 3, pitch, vel, base + beat, dur)

    m.note(t_organ, 0, 50, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/boss_bonelord.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "boss_bonelord.ogg"), loop_beats * (60.0 / bpm), gain="0.80")


def build_boss_bloodmoon():
    # 24 bars of 4/4 @ 144 BPM = exact 40.0s loop (frantic Blood Moon endgame climax in D minor)
    bpm = 144.0
    loop_beats = 96.0
    m = MidiBuilder(bpm)

    t_str = m.add_track()
    t_organ = m.add_track()
    t_choir = m.add_track()
    t_lead = m.add_track()
    t_timp = m.add_track()
    t_perc = m.add_track()

    # Strings(48), Pipe Organ(19), Choir Aahs(52), Violin(40), Timpani(47), Perc(9)
    m.program(t_str, 0, 48);   m.cc(t_str, 0, 7, 94);   m.cc(t_str, 0, 91, 96);  m.cc(t_str, 0, 10, 54)
    m.program(t_organ, 1, 19); m.cc(t_organ, 1, 7, 84); m.cc(t_organ, 1, 91, 112); m.cc(t_organ, 1, 10, 64)
    m.program(t_choir, 2, 52); m.cc(t_choir, 2, 7, 86); m.cc(t_choir, 2, 91, 120); m.cc(t_choir, 2, 10, 64)
    m.program(t_lead, 3, 40);  m.cc(t_lead, 3, 7, 94);  m.cc(t_lead, 3, 91, 110); m.cc(t_lead, 3, 10, 72)
    m.program(t_timp, 4, 47);  m.cc(t_timp, 4, 7, 98);  m.cc(t_timp, 4, 91, 94);  m.cc(t_timp, 4, 10, 60)
    m.cc(t_perc, 9, 7, 74);    m.cc(t_perc, 9, 91, 78)

    # 12 chords x 2 bars (8 beats each) = 96 beats
    chords = [
        (38, [50, 57, 62, 65], [62, 65, 69]),  # Dm
        (46, [46, 53, 58, 62], [62, 65, 70]),  # Bb
        (48, [48, 55, 60, 64], [64, 67, 72]),  # C
        (45, [45, 52, 57, 61], [61, 64, 69]),  # A
        (43, [43, 50, 55, 58], [62, 67, 70]),  # Gm
        (39, [39, 46, 55, 58], [62, 67, 70]),  # Eb
        (45, [45, 52, 57, 62], [62, 64, 69]),  # Asus4
        (45, [45, 52, 55, 61], [61, 64, 69]),  # A7
        # B-section desperate climb
        (46, [46, 53, 58, 65], [65, 70, 74]),  # Bb
        (48, [48, 55, 60, 67], [67, 72, 76]),  # C
        (38, [50, 57, 62, 65], [69, 74, 77]),  # Dm high
        (45, [45, 52, 55, 61], [69, 73, 76]),  # A7 high
    ]

    lead_melody = [
        (0.0, 74, 1.5, 88), (1.5, 77, 1.5, 92), (3.0, 76, 1.0, 86), (4.0, 74, 2.0, 88), (6.0, 72, 1.5, 82),
        (8.0, 70, 1.5, 86), (9.5, 74, 1.5, 90), (11.0, 72, 1.0, 84), (12.0, 70, 2.0, 86), (14.0, 69, 1.5, 82),
        (16.0, 72, 1.5, 88), (17.5, 76, 1.5, 92), (19.0, 79, 2.5, 94), (22.0, 76, 1.5, 86),
        (24.0, 73, 3.0, 92), (27.0, 74, 1.0, 88), (28.0, 76, 3.5, 94),
        (32.0, 79, 2.0, 94), (34.0, 77, 1.0, 88), (35.0, 74, 2.5, 90), (38.0, 70, 1.5, 84),
        (40.0, 74, 2.0, 92), (42.0, 70, 1.0, 86), (43.0, 67, 2.5, 86), (46.0, 70, 1.5, 84),
        (48.0, 74, 3.0, 94), (51.0, 72, 1.0, 88), (52.0, 69, 3.5, 90),
        (56.0, 73, 2.0, 94), (58.0, 76, 2.0, 96), (60.0, 79, 2.0, 98), (62.0, 76, 1.5, 90),
        # B-section climax
        (64.0, 77, 2.5, 96), (66.5, 79, 1.5, 94), (68.0, 82, 3.5, 100),
        (72.0, 79, 2.5, 96), (74.5, 81, 1.5, 94), (76.0, 84, 3.5, 102),
        (80.0, 86, 3.0, 104), (83.0, 84, 1.0, 96), (84.0, 81, 3.5, 98),
        (88.0, 85, 3.0, 102), (91.0, 81, 1.0, 94), (92.0, 79, 2.0, 92), (94.0, 76, 1.5, 90),
    ]

    for p in range(2):
        base = p * loop_beats
        for idx, (bass, org, choir) in enumerate(chords):
            b0 = base + idx * 8.0
            # Frantic 8th-note string engine
            ost = [bass + 12, bass + 19, org[2], bass + 19, bass + 12, org[1], org[2], org[1]]
            for step in range(16):
                vel = 88 if step % 4 == 0 else (76 if step % 2 == 0 else 64)
                m.note(t_str, 0, ost[step % 8], vel, b0 + step * 0.5, 0.34)

            # Driving organ stabs on every 4 beats
            for half in range(2):
                bh = b0 + half * 4.0
                m.note(t_organ, 1, bass, 80, bh, 3.8)
                for n in org:
                    m.note(t_organ, 1, n, 72, bh, 3.8)

            # Soaring choir sustain
            for cp in choir:
                m.note(t_choir, 2, cp, 76 if idx < 8 else 90, b0, 7.8)

            # Relentless timpani + snare + ride/crash urgency
            if idx in (0, 4, 8):
                m.note(t_perc, 9, 49, 72, b0, 0.8)
            for bar in range(2):
                bb = b0 + bar * 4.0
                m.note(t_timp, 4, bass, 96, bb, 0.45)
                m.note(t_timp, 4, bass, 82, bb + 1.5, 0.4)
                m.note(t_timp, 4, bass, 88, bb + 2.5, 0.4)
                m.note(t_timp, 4, bass, 84, bb + 3.5, 0.35)
                m.note(t_perc, 9, 38, 66, bb + 1.0, 0.2)
                m.note(t_perc, 9, 38, 76, bb + 3.0, 0.2)
                for b in range(4):
                    m.note(t_perc, 9, 42, 48 if b % 2 == 0 else 36, bb + b, 0.15)

        for beat, pitch, dur, vel in lead_melody:
            m.note(t_lead, 3, pitch, vel, base + beat, dur)

    m.note(t_organ, 1, 50, 1, loop_beats * 2 + 2.0, 1.0)
    mid = "/tmp/boss_bloodmoon.mid"
    m.write(mid)
    render_seamless_ogg(mid, os.path.join(OUT_DIR, "boss_bloodmoon.ogg"), loop_beats * (60.0 / bpm), gain="0.78")


BUILDERS = {
    "map": build_map_theme,
    "duel": build_duel_theme,
    "weaver": build_boss_weaver,
    "zealot": build_boss_zealot,
    "begotten": build_boss_begotten,
    "bonelord": build_boss_bonelord,
    "bloodmoon": build_boss_bloodmoon,
}

if __name__ == "__main__":
    targets = sys.argv[1:] or list(BUILDERS.keys())
    if targets == ["bosses"]:
        targets = ["weaver", "zealot", "begotten", "bonelord", "bloodmoon"]
    for name in targets:
        print(f"Rendering {name}...")
        BUILDERS[name]()
    print("Done.")
