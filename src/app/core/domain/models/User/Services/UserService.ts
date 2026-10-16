import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../../../../models/User";
import { IUser } from "../Interface/IUser";
import { IUserToken } from "../Token/tokens";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(@Inject(IUserToken) private _iuser: IUser) {}

  /**
   * Gets all users
   *
   * @returns {Observable<User[]>} An observable of an array of User objects
   */
  getAll(): Observable<User[]> {
    return this._iuser.getAll();
  }
  /**
   * Gets a user by id
   *
   * @param {number} id The id of the user to get
   *
   * @returns {Observable<User>} An observable of a User object
   */
  getById(id: number): Observable<User> {
    return this._iuser.getById(id);
  }
  /**
   * Registers a user
   *
   * @param {User} user The user to register
   * @returns {Observable<User>} An observable of a User object
   */
  register(user: User): Observable<User> {
    // Delegate the registration to the IUser interface implementation
    return this._iuser.register(user);
  }
  /**
   * Updates a user
   *
   * @param {User} user The user to update
   * @returns {Observable<User>} An observable of the updated User object
   */
  update(user: User): Observable<User> {
    // Delegate the update operation to the IUser interface implementation
    return this._iuser.update(user);
  } // Update user
  /**
   * Deletes a user by id
   *
   * @param {number} id The id of the user to delete
   *
   * @returns {Observable<User>} An observable of the deleted User object
   */
  delete(id: number): Observable<User> {
    return this._iuser.delete(id);
  } // Delete user
  /**
   * Saves a user
   *
   * @param {User} user The user to save
   *
   * @returns {Observable<User>} An observable of the saved User object
   */
  save(user: User): Observable<User> {
    return this._iuser.save(user);
  }
}
// Compare this snippet from src/app/core/domain/models/User/DTO/User.ts:
