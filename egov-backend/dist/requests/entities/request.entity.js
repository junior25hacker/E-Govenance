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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingRequest = exports.RequestStage = void 0;
const typeorm_1 = require("typeorm");
const request_log_entity_1 = require("./request-log.entity");
var RequestStage;
(function (RequestStage) {
    RequestStage["PENDING"] = "PENDING";
    RequestStage["UNDER_REVIEW"] = "UNDER REVIEW";
    RequestStage["APPROVED"] = "APPROVED";
    RequestStage["REJECTED"] = "REJECTED";
})(RequestStage || (exports.RequestStage = RequestStage = {}));
let TrackingRequest = class TrackingRequest {
    requestId;
    userId;
    title;
    description;
    currentStatus;
    createdAt;
    updatedAt;
    logs;
};
exports.TrackingRequest = TrackingRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TrackingRequest.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TrackingRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TrackingRequest.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TrackingRequest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: RequestStage.PENDING
    }),
    __metadata("design:type", String)
], TrackingRequest.prototype, "currentStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TrackingRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TrackingRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => request_log_entity_1.RequestLog, log => log.request, { cascade: true }),
    __metadata("design:type", Array)
], TrackingRequest.prototype, "logs", void 0);
exports.TrackingRequest = TrackingRequest = __decorate([
    (0, typeorm_1.Entity)('tracking_requests')
], TrackingRequest);
//# sourceMappingURL=request.entity.js.map