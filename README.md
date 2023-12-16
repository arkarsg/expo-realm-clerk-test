# Testing Expo, Clerk and MongoDB Realm with Device Sync

- **Expo** : React Native framework
- **Clerk** : Authentication provider
- **MongoDB Realm with Device Sync** : Offline-first database provider

---

## Setting up MongoDB Atlas App Services
1. Create free cluster
2. Create an app under App Services
3. Enable Device Sync.
    - Also enable `Developer Mode` since we want to create schemas programmatically instead of defining it in Atlas
4. Under `Authentication`, enable `Email and Password`
    - This step may not be necessary but do this if you want to do a [sanity check](#sanity-checks)
    - Let's automatically verify the users
    - Now, for our `Reset` password, enter a dummy site such as `localhost`. Otherwise, we cannot save the changes.
5. Deploy the App.

---

## Sanity Checks
1. Create an Expo app with Realm.
2. May need to do some `prebuild` but there are some good resources available from MongoDB docs
3. Define a simple schema: `Task`
4. Wrap our entry point with `RealmProvider` to test it offline by creating some sample tasks
5. Now, wrap with `AppProvider` and `UserProvider`.
6. Let's create a simple `LogIn` page to test Atlas Sync by itself. This will be the temporary `fallback` component for `UserProvider`
7. We will be using random, dummy emails and passwords since they are automatically verified anyway.
8. If everything is done correctly, a user with a random email and password will be reflected in `Pending` upon register and under `Users` upon logging in in your Atlas Users dashboard.

Now, we are sure that our Expo and Atlas App Services are set up correctly.

---

## Setting up with Clerk
1. Set up Clerk normally:
    - Create `Log in`, `Register` components. I will be ignoring `Reset` password
    - Wrap the application with `ClerkProvider`. Now, ClerkProvider will be the outermost provider.
2. Usually, with Clerk, we will have
```js
export default function RootLayout() {
    // ...
    return (
        <ClerkProvider publishableKey={CLERK_KEY} tokenCache={cache}>
            <Navigation />
        </ClerkProvider>
    )
}
```
where `Navigation` checks whether a user is signed in.

### Incorrect
Define our `fallback` component of `UserProvider` to be `ClerkLogin`, and replace `Navigation` component with `TaskListScreen`.

Usually done this way when using Realm. This is not right because the moment we navigate to another page, such as `Register` from our Login page, we may get the error:
> Attempted to navigate before mounting the Root Layout

I assume this is because `UserProvider` immediately loads the `ClerkLogin` instead of mounting the root component, such as `Navigation`, as above. You can verify this behaviour by directing to a different sign in page through `Navigation` and a different `fallback` component. You will be routed to the `fallback` component

### My implementation
Create an `InitialLayout` which acts as `Navigation`. In this component, we check if:
1. user is logged into Realm through `useApp`
2. user is signed in via Clerk

Both conditions satisfy -> redirect to TaskListScreen. Else, redirect to `Login` page.

Then in our `RootLayout`,
```js
export default function RootLayout() {
    // ...
    return (
        <ClerkProvider publishableKey={CLERK_KEY} tokenCache={cache}>
            <AppProvider id={APP_ID}>
                <UserProvider fallback={InitialLayout}>
                    <RealmProvider schema={[Task]}>
                        <InitialLayout />
                    </RealmProvider>
                </UserProvider>
            </AppProvider>
        </ClerkProvider> 
    )
}
```

We set `fallback` to be exactly `InitalLayout`. In other words, instead of letting Realm handle routing based on auth status, we just let Clerk handle it in root component.

---

## Authenticating App Sync with Clerk

Now, we are ready to work with `Custom JWT Authentication` in Atlas App services.

- In the Atlas App service, use JWK URI as the verification method
- Set the `Audience` field to the endpoint found on Clerk for example:
    - `https://your-app-123.clerk.accounts.dev/`
- Now, in Clerk, create a custom JWT template containing all the metadata that you need, such as the email, username. More importantly, include an `aud` field:

Example:
```
{
	"id": "{{user.id}}",
	"aud": "https://quick-mite-52.accounts.dev/",
	"name": "{{user.username}}",
	"role": "authenticated",
	"email": "{{user.primary_email_address}}"
}
```

---

And that's it, now whenever you register through Clerk, a new user will be reflected on your Atlas App.

---
