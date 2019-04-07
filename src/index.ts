console.log('Hello world!');

interface Fn {
	kind: "fn"
	callee: (...x: any) => any;
	args: AstNode[];
}

interface Id {
	kind: "id";
	name: string;
}

interface Lit {
	kind: "lit";
	value: any;
}

interface Block {
	kind: "block";
	nodes: AstNode[];
}

type AstNode = Block | Fn | Id | Lit;

const dsl = {
	fn: (callee: (...x: any) => any, args: AstNode[] = []): Fn => ({ kind: "fn", callee, args }),
	id: (name: string): Id => ({ kind: "id", name }),
	lit: (value: any): Lit => ({ kind: "lit", value }),
	block: (nodes: AstNode[] = []): Block => ({ kind: "block", nodes }),
};

interface Scope {
	[key: string]: AstNode;
}

const runner = (node: AstNode, scope: Scope = {}): any => {
	switch (node.kind) {
		case "fn": {
			const argVals = node.args.map(arg => runner(arg, scope));
			return node.callee.apply(scope, argVals);
		}

		case "id": {
			return scope[node.name];
		}

		case "lit":
			return node.value;

		case "block": {
			const newScope = { ...scope };
			node.nodes.forEach(child => {
				runner(child, newScope);
			});
			return newScope;
		}
	}
}

function assign(name: string, value: any): any {
	this[name] = value;
	return value;
};

const add = (x: number, y: number) => x + y;
const sub = (x: number, y: number) => x - y;
const mul = (x: number, y: number) => x * y;
const div = (x: number, y: number) => x / y;

console.log('Simple assign', runner(dsl.fn(assign, [
	dsl.lit("x"),
	dsl.lit(10)
])));

console.log('Block math', runner(dsl.block([
	dsl.fn(assign, [dsl.lit("x"), dsl.lit(10)]),
	dsl.fn(assign, [dsl.lit("y"), dsl.lit(20)]),
	dsl.fn(assign, [dsl.lit("addres"), dsl.fn(add, [
		dsl.id("x"), dsl.id("y"),
	])]),
	dsl.fn(assign, [dsl.lit("subres"), dsl.fn(sub, [
		dsl.id("x"), dsl.id("y"),
	])]),
	dsl.fn(assign, [dsl.lit("mulres"), dsl.fn(mul, [
		dsl.id("x"), dsl.id("y"),
	])]),
	dsl.fn(assign, [dsl.lit("divres"), dsl.fn(div, [
		dsl.id("x"), dsl.id("y"),
	])]),
])));
