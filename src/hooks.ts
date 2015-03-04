/**
 * Created by jcabresos on 2/12/15.
 */
import signals = require('kola-signals');

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
    constructor(kommand: Kommand<T>) {
        this.name = "ExecutionChainTimeout";
        this.message = "Execution timeout";
        this.kommand = kommand;
    }
}

export class ExecutionChain<T> {

    payload: T;
    kontext: any;
    options: ExecutionOptions<T>;

    private currentIndex: number;
    private executed: {[n: number]: boolean};
    private timeoutId: number;
    private executeCommand: (index: number, executable: () => void) => void;

    constructor(payload: T, kontext: any, options: ExecutionOptions<T>) {
        this.payload = payload;
        this.kontext = kontext;
        this.options = options;
        this.currentIndex = 0;
        this.executed = {};
    }

    now(): ExecutionChain<T> {
        this.next();

        return this;
    }

    private onDone(index: number, error? : Error): void {
        //if this index is equal to currentIndex then call next
        //if not, ignore, but if it has an error, let it call on error

        clearTimeout(this.timeoutId);

        if(error && this.options.errorCommand) {
            this.options.errorCommand(error, this.kontext);
            if(this.options.fragile)
                return;
        }
        else {
            this.currentIndex++;
        }

        this.next();
    }

    private next(): void {
        if(this.executed[this.currentIndex])
            return;

        if(this.currentIndex < this.options.commands.length) {
            var command = this.options.commands[this.currentIndex];

            var done: (error?: Error) => void;

            if(command.length > 2) {
                done = (error?: Error) => {
                    this.onDone(this.currentIndex, error);
                }

                var onTimeout = () => {
                    this.onDone(this.currentIndex, new ExecutionChainTimeout(command));
                }

                this.timeoutId = setTimeout(onTimeout, this.options.timeout);

                command(this.payload, this.kontext, done);
            }
            else {
                ;
                command(this.payload, this.kontext);
                this.currentIndex++;
                this.next();
            }

            this.executed[this.currentIndex] = true;
        }
    }
}

export class ExecutionChainFactory<T> implements Hook<T>{

    private commandChain: Kommand<T>[];
    private onErrorCommand: Kommand<Error>;
    private chainBreaksOnError: boolean;
    private timeoutMs: number;

    constructor(commandChain: Kommand<T>[]) {
        this.commandChain = commandChain;
    }

    breakChainOnError(value: boolean): ExecutionChainFactory<T> {
        this.chainBreaksOnError = value;
        return this;
    }

    onError(command: Kommand<Error>): ExecutionChainFactory<T> {
        this.onErrorCommand = command;
        return this;
    }

    timeout(ms: number): ExecutionChainFactory<T> {
        this.timeoutMs = ms;
        return this;
    }

    execute(payload: T, kontext: any): ExecutionChain<T> {
        return new ExecutionChain(payload, kontext, {
            "commands": this.commandChain,
            "errorCommand": this.onErrorCommand,
            "fragile": this.chainBreaksOnError,
            "timeout": this.timeoutMs
        }).now();
    }
}

export function executes<T>(kommand: Kommand<T>[]) {
    return new ExecutionChainFactory(kommand);
}
