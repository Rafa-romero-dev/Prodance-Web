import { BaseRepository } from '@/lib/baseRepository'
import { BusinessRuleError } from '@/lib/errors'
import type { AssessmentDTO } from '../types'

export class AssessmentRepository extends BaseRepository {
  /**
   * Create a new assessment for student re-entry
   */
  async createAssessment(
    studentId: string,
    studentCycleId: string,
    classId: string,
    teacherId: string,
    chargeId: string
  ): Promise<AssessmentDTO> {
    try {
      const assessment = await this.db.levelAssessment.create({
        data: {
          studentId,
          studentCycleId,
          recommendedClassId: null,
          teacherId,
          chargeId,
          status: 'PENDING_PAYMENT',
        },
      })

      return this.mapToDTO(assessment)
    } catch (error) {
      this.handlePrismaError(error, 'createAssessment')
    }
  }

  /**
   * Get assessment by ID
   */
  async getAssessmentById(assessmentId: string): Promise<AssessmentDTO | null> {
    try {
      const assessment = await this.db.levelAssessment.findUnique({
        where: { id: assessmentId },
      })

      return assessment ? this.mapToDTO(assessment) : null
    } catch (error) {
      this.handlePrismaError(error, 'getAssessmentById')
    }
  }

  /**
   * Get assessments for a student
   */
  async getAssessmentsForStudent(studentId: string): Promise<AssessmentDTO[]> {
    try {
      const assessments = await this.db.levelAssessment.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      })

      return assessments.map((a) => this.mapToDTO(a))
    } catch (error) {
      this.handlePrismaError(error, 'getAssessmentsForStudent')
    }
  }

  /**
   * Get assessments for a student cycle
   */
  async getAssessmentsForCycle(studentCycleId: string): Promise<AssessmentDTO[]> {
    try {
      const assessments = await this.db.levelAssessment.findMany({
        where: { studentCycleId },
        orderBy: { createdAt: 'desc' },
      })

      return assessments.map((a) => this.mapToDTO(a))
    } catch (error) {
      this.handlePrismaError(error, 'getAssessmentsForCycle')
    }
  }

  /**
   * Get pending payment assessments for a student
   */
  async getPendingPaymentAssessments(studentId: string): Promise<AssessmentDTO[]> {
    try {
      const assessments = await this.db.levelAssessment.findMany({
        where: {
          studentId,
          status: 'PENDING_PAYMENT',
        },
        orderBy: { createdAt: 'desc' },
      })

      return assessments.map((a) => this.mapToDTO(a))
    } catch (error) {
      this.handlePrismaError(error, 'getPendingPaymentAssessments')
    }
  }

  /**
   * Mark assessment as ready (payment approved)
   */
  async markReady(assessmentId: string): Promise<AssessmentDTO> {
    try {
      const assessment = await this.db.levelAssessment.update({
        where: { id: assessmentId },
        data: {
          status: 'READY',
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(assessment)
    } catch (error) {
      this.handlePrismaError(error, 'markReady')
    }
  }

  /**
   * Complete assessment (teacher selects target level)
   */
  async completeAssessment(
    assessmentId: string,
    targetClassId: string,
    notes?: string
  ): Promise<AssessmentDTO> {
    try {
      const assessment = await this.db.levelAssessment.update({
        where: { id: assessmentId },
        data: {
          status: 'COMPLETED',
          recommendedClassId: targetClassId,
          performedAt: new Date(),
          notes: notes || null,
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(assessment)
    } catch (error) {
      this.handlePrismaError(error, 'completeAssessment')
    }
  }

  /**
   * Cancel assessment
   */
  async cancelAssessment(assessmentId: string): Promise<AssessmentDTO> {
    try {
      const assessment = await this.db.levelAssessment.update({
        where: { id: assessmentId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(assessment)
    } catch (error) {
      this.handlePrismaError(error, 'cancelAssessment')
    }
  }

  /**
   * Check if assessment exists for a class in a cycle
   */
  async hasAssessmentForClass(
    studentCycleId: string,
    classId: string
  ): Promise<boolean> {
    try {
      const assessment = await this.db.levelAssessment.findFirst({
        where: {
          studentCycleId,
          // Note: We don't have classId field, so we check by checking if any assessment exists
          // This is a simplification - in full implementation might need different logic
        },
      })

      return !!assessment
    } catch (error) {
      this.handlePrismaError(error, 'hasAssessmentForClass')
    }
  }

  /**
   * Private helper: Map assessment record to DTO
   */
  private mapToDTO(record: any): AssessmentDTO {
    return {
      id: record.id,
      studentId: record.studentId,
      studentCycleId: record.studentCycleId,
      recommendedClassId: record.recommendedClassId,
      status: record.status,
      teacherId: record.teacherId,
      chargeId: record.chargeId,
      performedAt: record.performedAt,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
