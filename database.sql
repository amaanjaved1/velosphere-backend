-- Create a database called velosphereDB
CREATE DATABASE velosphereDB;

CREATE TABLE users (
    -- These are the fields that cannot be changed
    id SERIAL NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    -- These are fields that can be changed
    studentProgram VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    internPosition VARCHAR(255) NOT NULL,
    educationalInstitution VARCHAR(255) NOT NULL,
    schoolProgram VARCHAR(255) NOT NULL,
    profilePicture VARCHAR(255) NULL,
    meInOneSentence VARCHAR(255) NULL,
    studentLocation VARCHAR(255) NULL,
    twitter VARCHAR(255) NULL,
    linkedIn VARCHAR(255) NULL,
    facebook VARCHAR(255) NULL,
    github VARCHAR(255) NULL,
    meIn4Tags1 VARCHAR(255) NULL,
    meIn4Tags2 VARCHAR(255) NULL,
    meIn4Tags3 VARCHAR(255) NULL,
    meIn4Tags4 VARCHAR(255) NULL,
    internTeam VARCHAR(255) NULL,
    currentTerm VARCHAR(3) NOT NULL,
    pastTerms VARCHAR(255) NULL,
    confirmed boolean DEFAULT false,
    PRIMARY KEY (id)
);

CREATE TABLE connections (
    id SERIAL NOT NULL,
    user1id VARCHAR(255) NOT NULL, -- email
    user2id VARCHAR(255) NOT NULL, -- email
    cstate VARCHAR(255) NOT NULL, -- pending, accepted
    PRIMARY KEY (id)
);

