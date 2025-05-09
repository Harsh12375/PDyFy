import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";

const dbClient = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  region: process.env.AWS_BUCKET_REGION as string,
});
const docClient = DynamoDBDocumentClient.from(dbClient);

export async function userFileUpload(file_name: string, user_id: string) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_USER_FILES_TABLE,
    Item: {
      user_id: user_id,
      file_url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${file_name}`,
      timestamp: Date.now(),
      chat_id: `chat_${nanoid(10)}`,
      document_id: -1,
    },
  };
  try {
    await docClient.send(new PutCommand(params));
    return { success: true, chat_id: params.Item.chat_id };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function checkAlreadyExistsFile(
  file_name: string,
  user_id: string
) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_USER_FILES_TABLE,
    Key: {
      user_id: user_id,
      file_url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${file_name}`,
    },
  };
  try {
    const { Item } = await docClient.send(new GetCommand(params));

    if (Item) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function setDocumentId(chat_id: string, document_id: string) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_USER_FILES_TABLE,
    Key: {
      chat_id: chat_id,
    },
    UpdateExpression: "set document_id = :document_id",
    ExpressionAttributeValues: {
      ":document_id": document_id,
    },
  };

  try {
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error(error);
  }
}

export async function getDocumentId(chat_id: string) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_USER_FILES_TABLE,
    Key: {
      chat_id: chat_id,
    },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item?.document_id;
  } catch (error) {
    console.error(error);
    return -1;
  }
}
