import React from "react";
import "./Profile.css";
import Avatar from "../assets/profile.jpg";

const Profile: React.FC = () => {
  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-content">
          {/* Left side */}
          <div className="profile-left">
            <div className="info-box">
              <h3>About Me :</h3>
              <p>
                I am a university student in Post and Telecommunication
                Institute of Technology
              </p>
              <p>
                <strong>Address:</strong> Thanh Hoa, Viet Nam
              </p>
            </div>

            <div className="info-box">
              <h3>Contact :</h3>
              <p>
                <strong>Phone:</strong> 0852440515
              </p>
              <p>
                <strong>Email:</strong> thanh551419a@gmail.com
              </p>
            </div>

            <div className="info-box">
              <h3>Academy Links :</h3>
              <p>
                <strong>Github:</strong>{" "}
                <a
                  href="https://github.com/thanh551419a/IOT-project"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Project
                </a>
              </p>
              <p>
                <strong>Document:</strong>{" "}
                <a
                  href="https://docs.google.com/document/d/1BRLnftfaA4dmBSqmGbkmJPE-CUntVYR3lcXMtcFd8V4/edit?tab=t.0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View here
                </a>
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="profile-right">
            <img src={Avatar} alt="avatar" className="avatar" />
            <p>
              <strong>Student ID:</strong> B22DCCN789
            </p>
            <p>
              <strong>Class ID:</strong> D22HTTT05
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
