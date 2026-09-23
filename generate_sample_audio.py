#!/usr/bin/env python3
"""
Generador de Audio de Ejemplo Romántico (Synthesizer & Rain Ambient)
Crea un archivo WAV romántico de demostración para el estudio web.
"""

import wave
import struct
import math
import random
import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SAMPLE_RATE = 44100
DURATION = 15.0  # 15 segundos de demo
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

# Notas románticas (A menor / C mayor progression): A3, C4, E4, G4, F3, C4, E4, G4
CHORDS = [
    [220.00, 261.63, 329.63, 392.00], # Am7
    [174.61, 261.63, 329.63, 392.00], # Fmaj7
    [261.63, 329.63, 392.00, 523.25], # Cmaj7
    [196.00, 246.94, 293.66, 392.00]  # G
]

output_filename = "youtube_romantic_studio/sample_romantic.wav"

with wave.open(output_filename, 'w') as wav_file:
    wav_file.setnchannels(2)  # Stereo
    wav_file.setsampwidth(2)  # 16-bit
    wav_file.setframerate(SAMPLE_RATE)
    
    for i in range(TOTAL_SAMPLES):
        t = i / SAMPLE_RATE
        
        # Determinar acorde actual (cambia cada 3.75s)
        chord_idx = int(t / 3.75) % len(CHORDS)
        current_chord = CHORDS[chord_idx]
        
        # Generar notas con envolvente suave (estilo guitarra/piano romántico)
        signal = 0.0
        chord_t = t % 3.75
        envelope = math.sin(math.pi * (chord_t / 3.75)) ** 0.5
        
        for freq in current_chord:
            # Acorde + armónicos suaves
            wave_val = math.sin(2 * math.pi * freq * t) * 0.4
            wave_val += math.sin(4 * math.pi * freq * t) * 0.1
            signal += wave_val
        
        # Ruido rosa ambiental estilo lluvia suave
        rain_noise = (random.random() * 2 - 1) * 0.03
        
        mix_left = (signal * envelope * 0.25) + rain_noise
        mix_right = (signal * envelope * 0.25) + rain_noise
        
        # Clipping prevention
        mix_left = max(-1.0, min(1.0, mix_left))
        mix_right = max(-1.0, min(1.0, mix_right))
        
        sample_left = int(mix_left * 32767)
        sample_right = int(mix_right * 32767)
        
        data = struct.pack('<hh', sample_left, sample_right)
        wav_file.writeframesraw(data)

print(f"✅ Archivo de audio romántico de ejemplo creado: {output_filename}")
