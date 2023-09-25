import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export default NextAuth({
  // Configure one or more authentication providers

  providers: [
    // ...add more providers here

    Credentials({
      name: "Custom Login",
      credentials: {
        email: {
          label: "Correo:",
          type: "email",
          placeholder: "correo@google.com",
        },
        password: {
          label: "Contraseña:",
          type: "password",
          placeholder: "Contraseña",
        },
      },
      async authorize(credentials: any) {
        console.log("credentials");
        console.log({ credentials });
        // // return { name: 'Juan', correo: 'juan@google.com', role: 'admin' };
        const pathUrl = "http://localhost:3001/api/login"; // Agrega el protocolo "http://" si es necesario
        console.log("pathUrl");
        console.log({ pathUrl });
        console.log( {email: credentials.email, password: credentials.password});
        const result = await axios.post(pathUrl, {email: credentials.email, password: credentials.password});
        console.log("result");
        console.log({ result });
        if (result.data.ok) {
          console.log("result.data.ok");
          console.log({ result });
          return result.data.usuario;
        } else {
          console.log("result.data.ok false");
          return null; // Return null if credentials are invalid
        }

        // dbUsers.checkUserEmailPassword(
        //     credentials!.email,
        //     credentials!.password
        //     );
      },
    }),
  ],

  // Custom Pages
  pages: {
    signIn: "/auth/login",
  },

  //   // Callbacks
  jwt: {
    secret: process.env.JWT_SECRET_SEED, // deprecated
  },

  session: {
    maxAge: 2592000, /// 30d
    strategy: "jwt",
    updateAge: 86400, // cada día
  },

  callbacks: {
    /* 
      TODO: Cada vez que se hace login o logout se ejecuta esto
    */
    async jwt({ token, account, user }) {
      console.log(account);
      console.log("account11");

      console.log({ token, account, user });

      if (account) {
        token.accessToken = account.access_token;

        switch (account.type) {
          case "oauth":
            //TODO: Aqui se guarda el token de google
            break;

          case "credentials":
            console.log("Si es credentials");
            console.log({ user });

            token.user = user;
            break;
        }
      }

      return token;
    },

    //Cuando se crea la session se ejecuta esto y se guarda en la cookie
    async session({ session, token, user }) {
      console.log("Ingresa a session por fin");
      console.log(`accessToken: ${session.accessToken} user: ${session.user}`);
      session.accessToken = token.accessToken as any;
      session.user = token.user as any;

      return session;
    },
  }, //http://localhost:3000/api/auth/session
});
