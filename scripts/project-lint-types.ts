/**
 * Types shared by the `project` plugin's rules in `project-lint-*.ts`.
 *
 * @module
 */

import type {
  LanguageOptions,
  Position,
  RuleDefinition,
  RuleVisitor,
  TextSourceCode,
} from "@eslint/core";
import type { TSESTree } from "@typescript-eslint/types";

/**
 * The source code both hosts hand a rule: its text, plus the comment list and
 * the index to position lookup ESLint and Oxlint each implement on it.
 */
export interface ProjectSourceCode extends TextSourceCode {
  getAllComments: () => TSESTree.Comment[];
  getLocFromIndex: (index: number) => Position;
}

/**
 * ESLint's default rule type parameters, except that a report points at a
 * TypeScript-ESTree node and comments are readable.
 */
export interface ProjectRuleTypes {
  LangOptions: LanguageOptions;
  Code: ProjectSourceCode;
  RuleOptions: [];
  Visitor: RuleVisitor;
  Node: TSESTree.Node;
  MessageIds: string;
  ExtRuleDocs: unknown;
}

/** A repo-local rule, in ESLint's standard `create` form. */
export type ProjectRule = RuleDefinition<ProjectRuleTypes>;
