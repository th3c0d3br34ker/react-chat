import "./App.css";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import React, { useRef, useState } from "react";

import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyDq7uCAtWtM5Ah8Rz5hDqcGMjnW0dFUI0o",
  authDomain: "jainam-react-chat.firebaseapp.com",
  databaseURL: "https://jainam-react-chat.firebaseio.com",
  projectId: "jainam-react-chat",
  storageBucket: "jainam-react-chat.appspot.com",
  messagingSenderId: "427662332496",
  appId: "1:427662332496:web:f194dd2242265d1f713755",
  measurementId: "G-JZD5RNTX6H",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>
          <span role="img" aria-label="Heading">
            Jainam's 💬 App
          </span>
        </h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign In: <span className="icon" />
      </button>
      <p className="text-center">
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          <span aria-label="Send" role="img">
            🕊️
          </span>
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} alt="profile" />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
