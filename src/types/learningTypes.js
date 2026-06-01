/**
 * @typedef {'not_started' | 'learning' | 'needs_revision' | 'mastered'} LearningStatus
 * @typedef {'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Mode' | 'Interview Mode'} DifficultyLevel
 * @typedef {'low' | 'medium' | 'high'} RevisionPriority
 *
 * @typedef {Object} Flashcard
 * @property {string} front
 * @property {string} back
 *
 * @typedef {Object} QuizQuestion
 * @property {'mcq'} type
 * @property {string} question
 * @property {string[]} options
 * @property {string} answer
 * @property {string} explanation
 *
 * @typedef {Object} LearningNode
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {string} analogy
 * @property {string} example
 * @property {string} whyItMatters
 * @property {string} commonMistake
 * @property {string[]} prerequisites
 * @property {'Beginner' | 'Intermediate' | 'Advanced'} difficulty
 * @property {LearningStatus} learningStatus
 * @property {RevisionPriority} revisionPriority
 * @property {Flashcard[]} flashcards
 * @property {QuizQuestion[]} quiz
 * @property {number} [depth]
 *
 * @typedef {Object} LearningEdge
 * @property {string} source
 * @property {string} target
 * @property {string} label
 * @property {string} [description]
 *
 * @typedef {Object} MapSettings
 * @property {DifficultyLevel} difficulty
 * @property {string} learningGoal
 * @property {string} timeAvailable
 *
 * @typedef {Object} ProgressState
 * @property {number} total
 * @property {number} notStarted
 * @property {number} learning
 * @property {number} needsRevision
 * @property {number} mastered
 * @property {number} completion
 *
 * @typedef {'class_photo' | 'website_screenshot' | 'youtube_screenshot' | 'lecture_slide' | 'textbook' | 'personal' | 'other'} SourceType
 * @typedef {'personal_note' | 'class_note' | 'website_note' | 'youtube_note' | 'other'} NoteSourceType
 *
 * @typedef {Object} SuggestedNode
 * @property {string} title
 * @property {string} summary
 * @property {string} [sourceAttachmentId]
 * @property {string} [sourceNoteId]
 *
 * @typedef {Object} SuggestedEdge
 * @property {string} sourceTitle
 * @property {string} targetTitle
 * @property {string} label
 *
 * @typedef {Object} MapAttachment
 * @property {string} id
 * @property {string} fileName
 * @property {string} fileType
 * @property {number} fileSize
 * @property {SourceType} sourceType
 * @property {string} [localUrl]
 * @property {string} [storageUrl]
 * @property {string} [linkedNodeId]
 * @property {string} [userNote]
 * @property {string} [extractedText]
 * @property {string} [extractedSummary]
 * @property {SuggestedNode[]} [suggestedNodes]
 * @property {SuggestedEdge[]} [suggestedEdges]
 * @property {string} createdAt
 *
 * @typedef {Object} UserNote
 * @property {string} id
 * @property {string} text
 * @property {string} [linkedNodeId]
 * @property {NoteSourceType} sourceType
 * @property {string} createdAt
 * @property {string} [updatedAt]
 */

export {};
