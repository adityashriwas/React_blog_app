import conf from "/src/conf/conf.js";
import { Client, Account, ID } from "/node_modules/.vite/deps/appwrite.js?v=ed246492";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount({email, password, name}) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                return this.login({email, password});
            } else {
                return userAccount;
            }
        } catch (error) {
            throw error;
        }
    }

    async login({email, password}) {
        try {
            const session = await this.account.createEmailSession(email, password);
            this.storeSession(session);
            return session;
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const session = this.getSession();
            if (session) {
                return await this.account.get();
            } else {
                throw new Error("No active session found. Please log in.");
            }
        } catch (error) {
            console.log("Appwrite services :: getCurrentUser :: error", error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
            this.clearSession();
        } catch (error) {
            console.log("Appwrite services :: logout :: error", error);
        }
    }

    storeSession(session) {
        localStorage.setItem("appwrite_session", JSON.stringify(session));
    }

    getSession() {
        const session = localStorage.getItem("appwrite_session");
        return session ? JSON.parse(session) : null;
    }

    clearSession() {
        localStorage.removeItem("appwrite_session");
    }
}

const authService = new AuthService();

export default authService;
