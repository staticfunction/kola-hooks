declare module 'kola-hooks' {
    export interface Hook<T> {
        execute(payload: T, kontext: any): void;
    }
    export interface Kommand<T> {
        (payload: T, kontext?: any, done?: (error?: Error) => void): void;
    }
    export interface ExecutionOptions<T> {
        commands: Kommand<T>[];
        errorCommand: Kommand<Error>;
        fragile?: boolean;
        timeout?: number;
    }
    export class ExecutionChainTimeout<T> implements Error {
        kommand: Kommand<T>;
        name: string;
        message: string;
        constructor(kommand: Kommand<T>);
    }
    export class ExecutionChain<T> {
        payload: T;
        kontext: any;
        options: ExecutionOptions<T>;
        private currentIndex;
        private executed;
        private timeoutId;
        private executeCommand;
        constructor(payload: T, kontext: any, options: ExecutionOptions<T>);
        now(): ExecutionChain<T>;
        private onDone(index, error?);
        private next();
    }
    export class ExecutionChainFactory<T> implements Hook<T> {
        private commandChain;
        private onErrorCommand;
        private chainBreaksOnError;
        private timeoutMs;
        constructor(commandChain: Kommand<T>[]);
        breakChainOnError(value: boolean): ExecutionChainFactory<T>;
        onError(command: Kommand<Error>): ExecutionChainFactory<T>;
        timeout(ms: number): ExecutionChainFactory<T>;
        execute(payload: T, kontext: any): ExecutionChain<T>;
    }
    export function executes<T>(kommand: Kommand<T>[]): ExecutionChainFactory<T>;
}


