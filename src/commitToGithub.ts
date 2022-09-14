import { Octokit } from "octokit";
import dayjs from "dayjs";

interface Comment {
  id: number;
  user: {
    id: number;
  } | null;
}

interface Context {
  issueNumber: number;
  userInfo: {
    id: number;
  };
  commentList: Array<Comment>;
}

const context: Context = {
  issueNumber: 0,
  userInfo: {
    id: 0,
  },
  commentList: [],
};

export async function commitToGithub(
  content: string,
  githubToken: string,
  owner: string,
  repo: string
) {
  const octokit = new Octokit({ auth: githubToken });
  await initContext()
  sendDailyContent(content);

  async function initContext() {
    const issueInfo = await getCurrentIssueInfo(currentIssueName());
    if (issueInfo) {
      context.issueNumber = issueInfo.number;
    }

    context.userInfo = await selfUserInfo();

    const commentList = await getCommentList();
    if (commentList) {
      context.commentList = commentList;
    }
  }

  function currentIssueName() {
    function getDate() {
      return dayjs().format("YYYY-MM-DD");
    }

    return `【每日分享】${getDate()}`;
  }

  async function getCurrentIssueInfo(issueName: string) {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
    });

    return data.find((info) => {
      return info.title === issueName;
    });
  }

  async function selfUserInfo() {
    const { data } = await octokit.request("/user");
    return data;
  }

  async function sendDailyContent(content: string) {
    if (!isCommented()) {
      addDailyContent(content);
    } else {
      updateDailyContent(content);
    }
  }

  function isCommented() {
    return context.commentList.some(
      ({ user }) => user!.id === context.userInfo.id
    );
  }

  function addDailyContent(content: string) {
    octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner,
        repo,
        issue_number: context.issueNumber,
        body: content,
      }
    );
  }

  function getCommentId() {
    const comment = context.commentList.find(
      ({ user }) => user!.id === context.userInfo.id
    );

    if (comment) {
      return comment.id;
    }
  }

  async function updateDailyContent(content: string) {
    const commentId = getCommentId();

    if (commentId) {
      octokit.request(
        "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
        {
          owner,
          repo,
          comment_id: commentId,
          body: content,
        }
      );
    }
  }

  async function getCommentList() {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner,
        repo,
        issue_number: context.issueNumber,
      }
    );

    return data;
  }
}