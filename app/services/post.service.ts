import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "./auth.service";
import * as _ from 'lodash'
import { AngularFireStorage } from "@angular/fire/compat/storage";


@Injectable()
export class PostService {

    userRoles: Array<string>;
    constructor(private auth: AuthService,
                private db: AngularFireStorage) {

    }
}