'use strict';
const formatFactory = require('./factory');
const abs = require('./abstract');
const ast = require('../ast');

const If = function(node) {
  const parts = [
    this.C_OPEN, this.WS,
    'if (', this.node(node.cond), '):', this.WS,
    this.C_CLOSE,
    this.node(node.body)
  ];
  if (node.else_) {
    // TODO: produce elseif expressions, rather than nested if/else
    parts.push(
      this.C_OPEN, 'else:', this.WS,
      this.C_CLOSE,
      this.node(node.else_)
    );
  }
  return parts.concat([
    this.C_OPEN, this.WS,
    'endif;', this.WS,
    this.C_CLOSE
  ]).join('');
};

const For = function(node) {
  const parts = [
    this.C_OPEN, this.WS,
    'foreach (',
    this.node(node.arr), this.WS,
    'in', this.WS,
    this.node(node.name),
    ')', this.WS,
    this.C_CLOSE
  ];

  // TODO: node.else_

  return parts.concat([
    this.node(node.body),
    this.C_OPEN, this.WS,
    'endforeach;', this.WS,
    this.C_CLOSE
  ]).join('');
};

const Symbol = function(node) {
  const prefix = node.parent && ast.getNodeType(node.parent) === 'Filter'
    ? ''
    : this.VAR_PREFIX;
  return prefix + node.value;
};

const Filter = function(node) {
  // XXX: render as a Call expression?
  const args = node.args.children;
  return [
    this.node(node.name, node),
    '(',
    args.map(arg => this.node(arg, node)).join(', '),
    ')'
  ].join('');
};

const accessor = function(symbol) {
  return '[' + this.quote(symbol, true) + ']';
};

module.exports = formatFactory({
  WS:           ' ',

  C_OPEN:       '<?php',
  C_CLOSE:      '?>',

  O_OPEN:       '<?=',
  O_CLOSE:      '?>',

  VAR_PREFIX:   '$',

  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  quote:        abs.quote,
  accessor:     accessor,

  Compare:      abs.Compare,
  If:           If,
  Filter:       Filter,
  For:          For,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         abs.NodeList,
  Symbol:       Symbol,
  TemplateData: abs.TemplateData
});
