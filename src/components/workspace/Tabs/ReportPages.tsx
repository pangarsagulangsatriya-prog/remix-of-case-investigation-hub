import React from "react";
import { cn } from "@/lib/utils";
import { ReportPage } from "./ReportDocumentCanvas";

import { FactChronologyModule } from "@/components/analysis/FactChronologyModule";
import { ActorAnalysisModule } from "@/components/analysis/ActorAnalysisModule";
import { PeepoAnalysisModule } from "@/components/analysis/PeepoAnalysisModule";
import { IplsAnalysisModule } from "@/components/analysis/IplsAnalysisModule";
import { PreventionAnalysisModule } from "@/components/analysis/PreventionAnalysisModule";

// --- Slide 01: Fakta & Kronologi ---
export const ReportFactPage = ({ 
  isActive, pageNumber, totalPages, version, status, factAgent, isThumbnail
}: any) => {
  const items = factAgent?.results?.chronology_items || [];
  
  return (
    <ReportPage isActive={isActive} isThumbnail={isThumbnail} pageNumber={pageNumber} totalPages={totalPages} title="Chronology" version={version} status={status}>
      <div className="flex-1 overflow-auto">
        <FactChronologyModule 
          initialItems={items}
          metadata={{}}
          readonly={status === 'APPROVED'}
          cleanMode={true}
          viewMode="default"
        />
      </div>
    </ReportPage>
  );
};

// --- Slide 02: Actor Analysis ---
export const ReportActorPage = ({ 
  isActive, pageNumber, totalPages, version, status, actorAgent, isThumbnail
}: any) => {
  const data = actorAgent?.results || { actor_registry: [], actor_registry_status: 'draft' };
  
  return (
    <ReportPage isActive={isActive} isThumbnail={isThumbnail} pageNumber={pageNumber} totalPages={totalPages} title="Actor Analysis" version={version} status={status}>
      <div className="flex-1 overflow-auto">
        <ActorAnalysisModule 
          data={data}
          readonly={status === 'APPROVED'}
          cleanMode={true}
          onSelectActor={() => {}}
          selectedActorId={null}
        />
      </div>
    </ReportPage>
  );
};

// --- Slide 03: PEEPO ---
export const ReportPeepoPage = ({ 
  isActive, pageNumber, totalPages, version, status, peepoAgent, isThumbnail
}: any) => {
  const data = peepoAgent?.results || {};

  return (
    <ReportPage isActive={isActive} isThumbnail={isThumbnail} pageNumber={pageNumber} totalPages={totalPages} title="PEEPO" version={version} status={status}>
      <div className="flex-1 overflow-auto">
        <PeepoAnalysisModule 
          data={data}
          readonly={status === 'APPROVED'}
          cleanMode={true}
          onSelectRow={() => {}}
          selectedRowId={null}
        />
      </div>
    </ReportPage>
  );
};

// --- Slide 04: IPLS ---
export const ReportIplsPage = ({ 
  isActive, pageNumber, totalPages, version, status, iplsAgent, isThumbnail
}: any) => {
  const data = iplsAgent?.results || {};

  return (
    <ReportPage isActive={isActive} isThumbnail={isThumbnail} pageNumber={pageNumber} totalPages={totalPages} title="IPLS" version={version} status={status}>
      <div className="flex-1 overflow-auto">
        <IplsAnalysisModule 
          data={data}
          readonly={status === 'APPROVED'}
          cleanMode={true}
          onSelectRow={() => {}}
          selectedRowId={null}
          onSync={() => {}}
        />
      </div>
    </ReportPage>
  );
};

// --- Slide 05: Prevention ---
export const ReportPreventionPage = ({ 
  isActive, pageNumber, totalPages, version, status, prevAgent, isThumbnail
}: any) => {
  const data = prevAgent?.results || {};

  return (
    <ReportPage isActive={isActive} isThumbnail={isThumbnail} pageNumber={pageNumber} totalPages={totalPages} title="Prevention" version={version} status={status}>
      <div className="flex-1 overflow-auto">
        <PreventionAnalysisModule 
          data={data}
          readonly={status === 'APPROVED'}
          cleanMode={true}
          onSelectRow={() => {}}
          selectedRowId={null}
          onSync={() => {}}
        />
      </div>
    </ReportPage>
  );
};
