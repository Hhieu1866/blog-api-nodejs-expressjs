import { hashnodeService } from "../services/hashnodeService";
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import prisma from "../config/prisma";
import { Request, Response } from "express";

const router = express.Router();

/**
 * GET /api/hashnode/publications
 * Lấy danh sách publications của user (id, title, host)
 */

router.get(
  "/publications",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const publications = await hashnodeService.getPublications();
      return res.json({ success: true, data: publications });
    } catch (error: any) {
      console.error("Error fetching hashnode publications: ", error);
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to fetch publications",
      });
    }
  },
);

export default router;

/**
 * POST /api/hashnode/publish
 * Body: { postId: string, publicationId: string }
 * - Lấy bài viết trong DB
 * - Kiểm tra quyền sở hữu
 * - Publish lên Hashnode bằng mutation `publishPost`
 * - Lưu lại hashnodeId, hashnodeUrl vào DB
 */
router.post(
  "/publish",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postId, publicationId } = req.body as {
        postId?: string;
        publicationId?: string;
      };
      const userId = (req as any).user?.id as string | undefined;

      if (!postId || !publicationId) {
        return res.status(400).json({
          success: false,
          error: "Missing postId or publicationId",
        });
      }

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });

      // fetch post
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }

      // xác thực quyền: chỉ tác giả được publish
      if (!userId || post.authorId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to publish this post",
        });
      }

      const published = await hashnodeService.publishPost(publicationId, {
        title: post.title,
        contentMarkdown: post.content,
      });

      // update DB
      await prisma.post.update({
        where: { id: postId },
        data: {
          hashnodeId: published.id,
          hashnodeUrl: published.url ?? null,
          isPublishedOnHashnode: true,
        },
      });

      return res.json({
        success: true,
        data: {
          postId: published.id,
          url: published.url,
          slug: published.slug,
        },
      });
    } catch (error: any) {
      console.error("Hashnode publish error:", error);
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to publish to Hashnode",
      });
    }
  },
);
