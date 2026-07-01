import { makeAutoObservable } from "mobx";

class ErrorStore {
    constructor() {
        makeAutoObservable(this);
    }
}

export const errorStore = new ErrorStore();