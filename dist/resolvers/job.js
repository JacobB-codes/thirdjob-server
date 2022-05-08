"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobResolver = void 0;
const Job_1 = require("../entities/Job");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const typeorm_1 = require("typeorm");
let JobInput = class JobInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], JobInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], JobInput.prototype, "description", void 0);
JobInput = __decorate([
    (0, type_graphql_1.InputType)()
], JobInput);
let JobResolver = class JobResolver {
    descriptionSnippet(root) {
        return root.description.slice(0, 50);
    }
    async jobs(limit, cursor) {
        const realLimit = limit ? Math.min(50, limit) : 50;
        return await Job_1.Job.find({
            where: cursor ? { createdAt: (0, typeorm_1.LessThan)(new Date(+cursor)) } : {},
            order: { createdAt: "DESC" },
            take: realLimit,
        });
    }
    job(id) {
        return Job_1.Job.findOne({ where: { id } });
    }
    async createJob(options, { req }) {
        return Job_1.Job.create(Object.assign(Object.assign({}, options), { creatorId: req.session.userId })).save();
    }
    async updateJob(id, title) {
        const job = await Job_1.Job.findOne({ where: { id } });
        if (!job) {
            return null;
        }
        if (typeof title !== "undefined") {
            Job_1.Job.update({ id }, { title });
        }
        return job;
    }
    async deleteJob(id) {
        await Job_1.Job.delete(id);
        return true;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Job_1.Job]),
    __metadata("design:returntype", String)
], JobResolver.prototype, "descriptionSnippet", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Job_1.Job]),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], JobResolver.prototype, "jobs", null);
__decorate([
    (0, type_graphql_1.Query)(() => Job_1.Job, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JobResolver.prototype, "job", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Job_1.Job),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [JobInput, Object]),
    __metadata("design:returntype", Promise)
], JobResolver.prototype, "createJob", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Job_1.Job, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("title", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], JobResolver.prototype, "updateJob", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JobResolver.prototype, "deleteJob", null);
JobResolver = __decorate([
    (0, type_graphql_1.Resolver)(Job_1.Job)
], JobResolver);
exports.JobResolver = JobResolver;
//# sourceMappingURL=job.js.map