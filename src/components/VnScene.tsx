import { useEffect } from 'react';
import { DialogueView } from './Dialogue/DialogueView';
import { CHARACTERS } from '~/content/characters';
import { EVENTS } from '~/content/events';
import { SCENES } from '~/content/scenes';
import { getNode } from '~/core/runtime';
import { useGameStore } from '~/store/gameStore';

interface Props {
  eventId: string;
  nodeId: string;
}

export function VnScene({ eventId, nodeId }: Props) {
  const advanceNode = useGameStore((state) => state.advanceNode);
  const chooseOption = useGameStore((state) => state.chooseOption);
  const exitToMap = useGameStore((state) => state.exitToMap);
  const goToEvent = useGameStore((state) => state.goToEvent);
  const endGame = useGameStore((state) => state.endGame);
  const playerMapId = useGameStore((state) => state.player.mapId);

  const graph = EVENTS[eventId];
  if (!graph) {
    throw new Error(`Event graph not found: ${eventId}`);
  }

  const node = getNode(graph, nodeId);
  const isChoice = node.type === 'choice';

  useEffect(() => {
    if (node.type !== 'spawnNpc' && node.type !== 'walkNpcTo') return;

    const t = window.setTimeout(() => {
      advanceNode();
    }, 200);
    return () => window.clearTimeout(t);
  }, [advanceNode, node]);

  useEffect(() => {
    if (node.type !== 'returnToMap') return;

    exitToMap(node.mapId, node.x, node.y, 'down');
  }, [exitToMap, node]);

  useEffect(() => {
    if (node.type !== 'enterMap') return;

    exitToMap(node.mapId, node.x, node.y, node.facing);
  }, [exitToMap, node]);

  useEffect(() => {
    if (node.type !== 'goToEvent') return;

    goToEvent(node.eventId, node.nodeId);
  }, [goToEvent, node]);

  useEffect(() => {
    if (node.type !== 'end') return;

    endGame(node.reason);
  }, [endGame, node]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (isChoice) return;
        event.preventDefault();
        const dialogueButton = document.querySelector<HTMLButtonElement>(
          '[data-dialogue-advance]',
        );
        dialogueButton?.click();
        return;
      }

      if (!isChoice || !/^[1-9]$/.test(event.key)) return;

      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= node.options.length) return;
      event.preventDefault();
      chooseOption(optionIndex);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chooseOption, isChoice, node]);

  const backgroundUrl = SCENES[playerMapId]?.backgroundUrl ?? SCENES.office.backgroundUrl;

  if (node.type === 'narration') {
    return (
      <DialogueView
        backgroundUrl={backgroundUrl}
        text={node.text}
        onAdvance={advanceNode}
      />
    );
  }

  if (node.type === 'dialogue') {
    const character = CHARACTERS[node.speaker];

    return (
      <DialogueView
        backgroundUrl={backgroundUrl}
        speakerName={character.displayName}
        speakerImageUrl={character.portraitUrl(node.emotion)}
        speakerEmotion={node.emotion}
        text={node.text}
        onAdvance={advanceNode}
      />
    );
  }

  if (node.type === 'choice') {
    return (
      <DialogueView
        backgroundUrl={backgroundUrl}
        text={node.prompt ?? ''}
        choices={node.options.map((option, index) => ({
          id: String(index),
          label: option.label,
        }))}
        onChoose={(id) => chooseOption(Number(id))}
      />
    );
  }

  return null;
}
