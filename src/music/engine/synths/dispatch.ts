import type { TrackId } from '../../types';
import type { HeldVoice, PercId, VoiceSynthHost } from '../types';
import { voiceCajon, voiceGuiro, voiceMaracas, voiceTimbal } from './cumbiaPerc';
import { voiceContrabajo } from './contrabajo';
import {
  voiceAcordeon,
  voiceBajoSexto,
  voiceRequinto,
  voiceTrompeta,
} from './cumbiaMelodic';
import {
  voiceAcidBass,
  voiceClap,
  voiceClosedHat,
  voiceHardKick,
  voiceLaser,
  voiceMentasm,
  voiceMetalOpen,
  voiceScreech,
  voiceTeknoStab,
} from './tekno';
import {
  voiceOctaveFill,
  voicePalmMute,
  voicePowerChord,
  voicePunkBass,
  voicePunkCrash,
  voicePunkHat,
  voicePunkKick,
  voicePunkLead,
  voicePunkSnare,
} from './punk';
import {
  voiceCelloBass,
  voiceClarinet,
  voiceGrandPiano,
  voiceHarp,
  voiceSoftCymbal,
  voiceTimpani,
  voiceTriangle,
  voiceViolin,
  voiceWoodblock,
} from './classical';

export function voicePerc(host: VoiceSynthHost, id: PercId, time: number, mixGain: number, sceneIdx: number) {
  const g = host.project.genre;
  if (g === 'tekno') {
    switch (id) {
      case 'kick':
        voiceHardKick(host, time, mixGain, sceneIdx);
        break;
      case 'snare':
        voiceClap(host, time, mixGain, sceneIdx);
        break;
      case 'hihat':
        voiceClosedHat(host, time, mixGain, sceneIdx);
        break;
      case 'mc':
        voiceMetalOpen(host, time, mixGain, sceneIdx);
        break;
    }
    return;
  }
  if (g === 'punk') {
    switch (id) {
      case 'kick':
        voicePunkKick(host, time, mixGain, sceneIdx);
        break;
      case 'snare':
        voicePunkSnare(host, time, mixGain, sceneIdx);
        break;
      case 'hihat':
        voicePunkHat(host, time, mixGain, sceneIdx);
        break;
      case 'mc':
        voicePunkCrash(host, time, mixGain, sceneIdx);
        break;
    }
    return;
  }
  if (g === 'classical') {
    switch (id) {
      case 'kick':
        voiceTimpani(host, time, mixGain, sceneIdx);
        break;
      case 'snare':
        voiceWoodblock(host, time, mixGain, sceneIdx);
        break;
      case 'hihat':
        voiceTriangle(host, time, mixGain, sceneIdx);
        break;
      case 'mc':
        voiceSoftCymbal(host, time, mixGain, sceneIdx);
        break;
    }
    return;
  }
  switch (id) {
    case 'kick':
      voiceCajon(host, time, mixGain, sceneIdx);
      break;
    case 'snare':
      voiceTimbal(host, time, mixGain, sceneIdx);
      break;
    case 'hihat':
      voiceGuiro(host, time, mixGain, sceneIdx);
      break;
    case 'mc':
      voiceMaracas(host, time, mixGain, sceneIdx);
      break;
  }
}

export function dispatchMelodic(
  host: VoiceSynthHost,
  id: TrackId,
  time: number,
  gain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
  hold = false,
): HeldVoice | void {
  const g = host.project.genre;
  if (g === 'tekno') {
    if (id === 'wt') return voiceMentasm(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'tp') return voiceScreech(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'an') {
      voiceTeknoStab(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'rg') {
      voiceLaser(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'bass') {
      voiceAcidBass(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    return;
  }
  if (g === 'punk') {
    if (id === 'wt') return voicePowerChord(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'tp') return voicePunkLead(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'an') {
      voicePalmMute(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'rg') {
      voiceOctaveFill(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'bass') {
      voicePunkBass(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    return;
  }
  if (g === 'classical') {
    if (id === 'wt') return voiceGrandPiano(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'tp') return voiceClarinet(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'an') return voiceViolin(host, time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'rg') {
      voiceHarp(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'bass') {
      voiceCelloBass(host, time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    return;
  }
  // cumbia default
  if (id === 'wt') return voiceAcordeon(host, time, gain, sceneIdx, midi, lengthSteps, hold);
  if (id === 'tp') return voiceTrompeta(host, time, gain, sceneIdx, midi, lengthSteps, hold);
  if (id === 'an') {
    voiceBajoSexto(host, time, gain, sceneIdx, midi, lengthSteps);
    return;
  }
  if (id === 'rg') {
    voiceRequinto(host, time, gain, sceneIdx, midi, lengthSteps);
    return;
  }
  if (id === 'bass') {
    voiceContrabajo(host, time, gain, sceneIdx, midi, lengthSteps);
  }
}
