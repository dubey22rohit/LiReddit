import { MyContext } from "src/types";
import { Resolver, Arg, Ctx, Field, InputType, Mutation, ObjectType } from "type-graphql";
import argon2 from 'argon2'
import { User } from "../entities/User";
@InputType()
class UsernameAndPasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernameAndPasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: "username must be of length greater than 5"
                }]
            }
        }
        if (options.password.length <= 2) {
            return {
                errors: [{
                    field: "password",
                    message: "password length must be greater than 5"
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = await em.create(User, { username: options.username, password: hashedPassword })
        try {
            await em.persistAndFlush(user)
        } catch (err) {
            if (err.code === '23505' || err.detail.includes('already exists')) {
                return {
                    errors: [{
                        field: 'username',
                        message: "username already taken"
                    }]
                }
            }
            console.log("message", err)
        }
        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernameAndPasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "This username does not exist"
                }]
            }

        }
        const validPassword = await argon2.verify(user.password, options.password)
        if (!validPassword) {
            return {
                errors: [{
                    field: "password",
                    message: "your password is incorrect"
                }]
            }
        }
        return {
            user
        }
    }
}