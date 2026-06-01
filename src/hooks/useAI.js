// Hook for AI generation calls. Wraps aiService with try/catch + toast errors.

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import * as aiService from '../services/aiService';

export function useAI() {
  const generateMap = useCallback(async (topic, settings) => {
    try {
      return await aiService.generateMap(topic, settings);
    } catch (err) {
      toast.error(err.message || 'Failed to generate map.');
      throw err;
    }
  }, []);

  const expandNode = useCallback(
    async (nodeLabel, parentTopic, parentDepth, parentId) => {
      try {
        return await aiService.expandNode(
          nodeLabel,
          parentTopic,
          parentDepth,
          parentId
        );
      } catch (err) {
        toast.error(err.message || 'Failed to expand concept.');
        throw err;
      }
    },
    []
  );

  const getNodeDetails = useCallback(async (conceptLabel, rootTopic) => {
    try {
      return await aiService.getNodeDetails(conceptLabel, rootTopic);
    } catch (err) {
      toast.error(err.message || 'Failed to load details.');
      throw err;
    }
  }, []);

  const getEdgeDescription = useCallback(
    async (sourceLabel, targetLabel, edgeLabel) => {
      try {
        return await aiService.getEdgeDescription(
          sourceLabel,
          targetLabel,
          edgeLabel
        );
      } catch (err) {
        toast.error(err.message || 'Failed to load connection info.');
        throw err;
      }
    },
    []
  );

  const analyzeImageAttachment = useCallback(async (attachment) => {
    try {
      return await aiService.analyzeImageAttachment(attachment);
    } catch (err) {
      toast.error(err.message || 'AI extraction is unavailable. You can still attach this image and add notes manually.');
      throw err;
    }
  }, []);

  const generateFromNote = useCallback(async (note, context) => {
    try {
      return await aiService.generateFromNote(note, context);
    } catch (err) {
      toast.error(err.message || 'Failed to generate nodes from note.');
      throw err;
    }
  }, []);

  return {
    generateMap,
    expandNode,
    getNodeDetails,
    getEdgeDescription,
    analyzeImageAttachment,
    generateFromNote,
  };
}
