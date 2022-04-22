import { Job } from "../entities/Job";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { LessThan } from "typeorm";

@InputType()
class JobInput {
  @Field()
  title: string;
  @Field()
  description: string;
}

@Resolver(Job)
export class JobResolver {
  @FieldResolver(() => String)
  descriptionSnippet(@Root() root: Job): string {
    return root.description.slice(0, 50);
  }

  @Query(() => [Job])
  async jobs(
    @Arg("limit", () => Int, { nullable: true }) limit: number | null,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Job[]> {
    const realLimit = limit ? Math.min(50, limit) : 50;
    return await Job.find({
      where: cursor ? { createdAt: LessThan(new Date(+cursor)) } : {},
      order: { createdAt: "DESC" },
      take: realLimit,
    });
  }

  @Query(() => Job, { nullable: true })
  job(@Arg("id", () => Int) id: number): Promise<Job | null> {
    return Job.findOne({ where: { id } });
  }

  @Mutation(() => Job)
  @UseMiddleware(isAuth)
  async createJob(
    @Arg("options") options: JobInput,
    @Ctx() { req }: MyContext
  ): Promise<Job> {
    return Job.create({
      ...options,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Job, { nullable: true })
  async updateJob(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Job | null> {
    const job = await Job.findOne({ where: { id } });

    if (!job) {
      return null;
    }
    if (typeof title !== "undefined") {
      Job.update({ id }, { title });
    }
    return job;
  }

  @Mutation(() => Boolean)
  async deleteJob(@Arg("id") id: number): Promise<boolean> {
    await Job.delete(id);
    return true;
  }
}
