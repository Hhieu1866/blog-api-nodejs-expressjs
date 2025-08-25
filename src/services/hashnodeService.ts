// src/services/hashnodeService.ts
export interface HashnodePublication {
  id: string;
  title: string;
}

type GqlResponse<T> = { data: T; errors?: Array<{ message: string }> };

export class HashnodeService {
  private apiKey: string;
  private apiUrl = "https://gql.hashnode.com";

  constructor() {
    this.apiKey = process.env.HASHNODE_API_KEY ?? "";
    if (!this.apiKey) throw new Error("HASHNODE_API_KEY is not defined");
  }

  private async request<T>(query: string, variables?: any): Promise<T> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Hashnode v2: truyền PAT trực tiếp, KHÔNG thêm 'Bearer'
        Authorization: this.apiKey,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = (await res.json()) as GqlResponse<T>;
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data;
  }

  // Lấy publications của user (cursor-based)
  async getPublications(): Promise<HashnodePublication[]> {
    const query = `
      query MePublications($first: Int!, $after: String) {
        me {
          publications(first: $first, after: $after) {
            edges {
              node { id title }
              cursor
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `;
    const data = await this.request<{
      me: { publications: { edges: { node: HashnodePublication }[] } };
    }>(query, { first: 20 });

    return data.me.publications.edges.map(e => e.node);
  }

  // Publish post
  async publishPost(
    publicationId: string,
    { title, contentMarkdown }: { title: string; contentMarkdown: string },
  ): Promise<{ id: string; slug: string; url?: string }> {
    const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post { id slug url }
        }
      }
    `;
    const data = await this.request<{
      publishPost: { post: { id: string; slug: string; url?: string } };
    }>(mutation, { input: { publicationId, title, contentMarkdown } });

    return data.publishPost.post;
  }
}

export const hashnodeService = new HashnodeService();
