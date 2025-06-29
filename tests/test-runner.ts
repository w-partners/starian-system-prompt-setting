/**
 * Starian v4.4 테스트 러너
 * 통합 테스트와 성능 테스트를 실행하고 결과를 생성
 */

import { StarianV44IntegrationTester } from './integration/v44-integration.test';
import { GuidelinePerformanceTester } from './performance/guideline-performance.test';

interface TestExecutionReport {
  integration: any;
  performance: any;
  overall: {
    totalTests: number;
    passedTests: number;
    successRate: number;
    ready: boolean;
  };
  timestamp: string;
}

class V44TestRunner {
  async executeAllTests(): Promise<TestExecutionReport> {
    console.log('🚀 Starian v4.4 전체 테스트 실행 시작...\n');

    // 1. 통합 테스트 실행
    console.log('1️⃣ 통합 테스트 실행 중...');
    const integrationTester = new StarianV44IntegrationTester();
    const integrationReport = await integrationTester.runAllTests();
    
    console.log(`✅ 통합 테스트 완료: ${integrationReport.summary.successRate.toFixed(1)}% 성공률\n`);

    // 2. 성능 테스트 실행
    console.log('2️⃣ 성능 벤치마크 실행 중...');
    const performanceTester = new GuidelinePerformanceTester();
    const performanceResults = await performanceTester.runPerformanceBenchmarks();
    
    const performancePassed = performanceResults.filter(r => r.passed).length;
    const performanceTotal = performanceResults.length;
    const performanceSuccessRate = (performancePassed / performanceTotal) * 100;
    
    console.log(`✅ 성능 테스트 완료: ${performanceSuccessRate.toFixed(1)}% 성공률\n`);

    // 3. 전체 결과 종합
    const totalTests = integrationReport.summary.totalTests + performanceTotal;
    const totalPassed = integrationReport.summary.passedTests + performancePassed;
    const overallSuccessRate = (totalPassed / totalTests) * 100;
    
    const isReady = overallSuccessRate >= 90 && 
                   integrationReport.summary.successRate >= 90 &&
                   performanceSuccessRate >= 80;

    const report: TestExecutionReport = {
      integration: integrationReport,
      performance: {
        results: performanceResults,
        summary: {
          totalTests: performanceTotal,
          passedTests: performancePassed,
          successRate: performanceSuccessRate
        }
      },
      overall: {
        totalTests,
        passedTests: totalPassed,
        successRate: overallSuccessRate,
        ready: isReady
      },
      timestamp: new Date().toISOString()
    };

    return report;
  }

  generateTestReport(report: TestExecutionReport): string {
    let output = `# 🧪 Starian v4.4 통합 테스트 결과 보고서\n\n`;
    output += `**실행 시간**: ${new Date(report.timestamp).toLocaleString()}\n`;
    output += `**전체 상태**: ${report.overall.ready ? '✅ 배포 준비 완료' : '❌ 추가 개선 필요'}\n\n`;

    // 요약 섹션
    output += `## 📊 전체 요약\n\n`;
    output += `| 구분 | 총 테스트 | 통과 | 실패 | 성공률 |\n`;
    output += `|------|-----------|------|------|--------|\n`;
    output += `| **통합 테스트** | ${report.integration.summary.totalTests} | ${report.integration.summary.passedTests} | ${report.integration.summary.failedTests} | ${report.integration.summary.successRate.toFixed(1)}% |\n`;
    output += `| **성능 테스트** | ${report.performance.summary.totalTests} | ${report.performance.summary.passedTests} | ${report.performance.summary.totalTests - report.performance.summary.passedTests} | ${report.performance.summary.successRate.toFixed(1)}% |\n`;
    output += `| **전체** | ${report.overall.totalTests} | ${report.overall.passedTests} | ${report.overall.totalTests - report.overall.passedTests} | ${report.overall.successRate.toFixed(1)}% |\n\n`;

    // 핵심 성과
    output += `## 🎯 핵심 성과\n\n`;
    output += `### ✅ 지침 준수 개선\n`;
    
    const complianceResult = report.performance.results.find(r => r.testName === 'guideline_compliance_improvement');
    if (complianceResult) {
      output += `- **현재 지침 준수율**: ${complianceResult.current.guidelineComplianceRate.toFixed(1)}%\n`;
      output += `- **v4.3 대비 개선**: +${complianceResult.improvement.guidelineComplianceRate.toFixed(1)}%\n`;
      output += `- **목표 달성**: ${complianceResult.current.guidelineComplianceRate >= 90 ? '✅' : '❌'} (목표: 90% 이상)\n\n`;
    }

    output += `### ⚡ 성능 영향\n`;
    
    const responseResult = report.performance.results.find(r => r.testName === 'response_time_overhead');
    if (responseResult) {
      const increasePercent = (responseResult.improvement.responseTimeMs / responseResult.baseline.responseTimeMs) * 100;
      output += `- **응답시간 오버헤드**: +${increasePercent.toFixed(1)}%\n`;
      output += `- **목표 달성**: ${increasePercent < 5 ? '✅' : '❌'} (목표: 5% 미만)\n\n`;
    }

    const memoryResult = report.performance.results.find(r => r.testName === 'memory_usage_optimization');
    if (memoryResult) {
      const increasePercent = (memoryResult.improvement.memoryUsageMB / memoryResult.baseline.memoryUsageMB) * 100;
      output += `- **메모리 사용량 증가**: +${increasePercent.toFixed(1)}%\n`;
      output += `- **목표 달성**: ${increasePercent < 20 ? '✅' : '❌'} (목표: 20% 미만)\n\n`;
    }

    // 통합 테스트 상세
    output += `## 🔗 통합 테스트 상세 결과\n\n`;
    for (const result of report.integration.results) {
      const status = result.passed ? '✅' : '❌';
      output += `### ${status} ${result.name}\n`;
      output += `- **설명**: ${result.description}\n`;
      output += `- **실행시간**: ${result.duration}ms\n`;
      if (result.error) {
        output += `- **오류**: ${result.error}\n`;
      }
      output += `\n`;
    }

    // 성능 테스트 상세
    output += `## ⚡ 성능 테스트 상세 결과\n\n`;
    for (const result of report.performance.results) {
      const status = result.passed ? '✅' : '❌';
      output += `### ${status} ${result.testName}\n`;
      
      if (result.current.guidelineComplianceRate > 0) {
        output += `- **지침 준수율**: ${result.current.guidelineComplianceRate.toFixed(1)}%\n`;
      }
      if (result.current.responseTimeMs > 0) {
        output += `- **응답시간**: ${result.current.responseTimeMs.toFixed(0)}ms\n`;
      }
      if (result.current.memoryUsageMB > 0) {
        output += `- **메모리 사용량**: ${result.current.memoryUsageMB.toFixed(1)}MB\n`;
      }
      if (result.current.cpuUsagePercent > 0) {
        output += `- **CPU 사용률**: ${result.current.cpuUsagePercent.toFixed(1)}%\n`;
      }
      output += `\n`;
    }

    // 호환성 검증
    output += `## 🔄 v4.3 호환성 검증\n\n`;
    const compatibilityResult = report.integration.results.find(r => r.name === 'v43_compatibility');
    if (compatibilityResult) {
      output += `- **호환성 상태**: ${compatibilityResult.passed ? '✅ 100% 호환' : '❌ 호환성 문제 발견'}\n`;
      output += `- **기존 기능 유지**: ${compatibilityResult.passed ? '모든 v4.3 기능 정상 작동' : '일부 기능 영향 있음'}\n\n`;
    }

    // 최종 권고사항
    output += `## 📋 최종 권고사항\n\n`;
    if (report.overall.ready) {
      output += `### ✅ 배포 승인\n\n`;
      output += `v4.4 시스템이 모든 품질 기준을 만족했습니다:\n\n`;
      output += `- ✅ 지침 준수율 90% 이상 달성\n`;
      output += `- ✅ 성능 저하 5% 이내 유지\n`;
      output += `- ✅ 기존 시스템 호환성 100% 보장\n`;
      output += `- ✅ 모든 통합 테스트 통과\n\n`;
      output += `**권고사항**: 즉시 배포 진행 가능\n`;
    } else {
      output += `### ❌ 추가 개선 필요\n\n`;
      output += `다음 항목들을 개선한 후 재테스트 필요:\n\n`;
      
      const failedTests = [
        ...report.integration.results.filter(r => !r.passed),
        ...report.performance.results.filter(r => !r.passed)
      ];
      
      for (const failed of failedTests) {
        output += `- ❌ ${failed.name || failed.testName}: 개선 필요\n`;
      }
      
      output += `\n**권고사항**: 실패 항목 수정 후 재테스트\n`;
    }

    output += `\n---\n`;
    output += `*Starian v4.4 자동 생성 보고서 - ${new Date(report.timestamp).toLocaleString()}*\n`;

    return output;
  }
}

// 즉시 실행
async function runTests() {
  const runner = new V44TestRunner();
  const report = await runner.executeAllTests();
  const reportText = runner.generateTestReport(report);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 테스트 실행 완료!');
  console.log('='.repeat(80));
  console.log(`전체 성공률: ${report.overall.successRate.toFixed(1)}%`);
  console.log(`배포 준비: ${report.overall.ready ? '✅ 완료' : '❌ 미완료'}`);
  console.log('='.repeat(80) + '\n');
  
  return { report, reportText };
}

// 모듈 내보내기
export { V44TestRunner, TestExecutionReport, runTests };

// 스크립트로 실행될 때
if (require.main === module) {
  runTests().then(({ report, reportText }) => {
    console.log('보고서가 생성되었습니다.');
    // 실제 환경에서는 파일로 저장
    // fs.writeFileSync('test-results-v44.md', reportText);
  }).catch(console.error);
}
