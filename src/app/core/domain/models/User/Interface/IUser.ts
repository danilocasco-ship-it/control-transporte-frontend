import { Observable } from "rxjs";
import { User } from "../../../../models/User";

export interface IUser {
  /**
   * Gets all users
   *
   * @returns {Observable<User[]>} An observable of an array of User objects
   */
  getAll(): Observable<User[]>; // Get all users

  /**
   * Gets a user by id
   *
   * @param {number} id The id of the user to get
   *
   * @returns {Observable<User>} An observable of a User object
   */
  getById(id: number): Observable<User>; // Get user by id

  /**
   * Registers a user
   *
   * @param {User} user The user to register
   *
   * @returns {Observable<User>} An observable of a User object
   */
  register(user: User): Observable<User>; // Register user

  /**
   * Updates a user
   *
   * @param {User} user The user to update
   *
   * @returns {Observable<User>} An observable of a User object
   */
  update(user: User): Observable<User>; // Update user

  /**
   * Deletes a user by id
   *
   * @param {number} id The id of the user to delete
   *
   * @returns {Observable<User>} An observable of a User object
   */
  delete(id: number): Observable<User>; // Delete user

  /**
   * Saves a user
   *
   * @param {User} user The user to save
   *
   * @returns {Observable<User>} An observable of a User object
   */
  save(user: User): Observable<User>; // Save user
}
// Compare this snippet from src/app/core/domain/models/User/User.ts:
