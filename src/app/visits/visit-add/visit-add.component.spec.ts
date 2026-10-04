import type { Mock } from 'vitest';
/*
 *
 *  * Copyright 2016-2017 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

/* tslint:disable:no-unused-variable */

/**
 * @author Vitaliy Fedoriv
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { VisitAddComponent } from './visit-add.component';
import { FormsModule } from '@angular/forms';
import { VisitService } from '../visit.service';
import { PetService } from '../../pets/pet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub, RouterStub } from '../../testing/router-stubs';
import { Pet } from '../../pets/pet';
import { Visit } from '../visit';
import { Observable, of } from 'rxjs';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
type Spy = Mock;
import { OwnerService } from '../../owners/owner.service';
import { VetService } from '../../vets/vet.service';
import { Vet } from '../../vets/vet';

class PetServiceStub {
    addPet(pet: Pet): Observable<Pet> {
        return of();
    }
    getPetById(petId: string): Observable<Pet> {
        return of();
    }
}

class OwnerServiceStub {
}

class VisitServiceStub {
    addVisit(visit: Visit): Observable<Visit> {
        return of();
    }
}

class VetServiceStub {
    getVets(): Observable<Vet[]> {
        return of();
    }
}

describe('VisitAddComponent', () => {
    let component: VisitAddComponent;
    let fixture: ComponentFixture<VisitAddComponent>;
    let petService: PetService;
    let visitService: VisitService;
    let testPet: Pet;
    let spy: Spy;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [VisitAddComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, MatDatepickerModule, MatMomentDateModule],
            providers: [
                { provide: PetService, useClass: PetServiceStub },
                { provide: VisitService, useClass: VisitServiceStub },
                { provide: OwnerService, useClass: OwnerServiceStub },
                { provide: VetService, useClass: VetServiceStub },
                { provide: Router, useClass: RouterStub },
                { provide: ActivatedRoute, useClass: ActivatedRouteStub }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisitAddComponent);
        component = fixture.componentInstance;
        testPet = {
            id: 1,
            name: 'Leo',
            birthDate: '2010-09-07',
            type: { id: 1, name: 'cat' },
            ownerId: 1,
            owner: {
                id: 1,
                firstName: 'George',
                lastName: 'Franklin',
                address: '110 W. Liberty St.',
                city: 'Madison',
                telephone: '6085551023',
                pets: null
            },
            visits: null
        };
        petService = fixture.debugElement.injector.get(PetService);
        visitService = fixture.debugElement.injector.get(VisitService);
        spy = vi.spyOn(petService, 'addPet').mockReturnValue(of(testPet));

        fixture.detectChanges();
    });

    it('should create VisitAddComponent', () => {
        expect(component).toBeTruthy();
    });

    it('should load vet list on init', () => {
        const vetService = fixture.debugElement.injector.get(VetService);
        const testVets: Vet[] = [
            {id: 2, firstName: 'Scott', lastName: 'Green', specialties: []},
            {id: 1, firstName: 'James', lastName: 'Carter', specialties: []}
        ];
        vi.spyOn(vetService, 'getVets').mockReturnValue(of(testVets));
        component.ngOnInit();
        expect(component.vets.length, 'vets loaded').toBe(2);
        expect(component.vets[0].firstName, 'sorted by firstName').toBe('James');
    });

    it('should render required vet select and allow submission only with vet selected', () => {
        component.visit = {
            id: null,
            date: '2026-10-05',
            description: 'vaccination',
            pet: testPet
        } as Visit;
        fixture.detectChanges();
        expect(component.visit.veterinarianId, 'vet unselected').toBeUndefined();
        const selectEl: HTMLSelectElement = fixture.debugElement.nativeElement.querySelector('select[name="veterinarianId"]');
        expect(selectEl, 'vet select rendered').toBeTruthy();
        expect(selectEl.required, 'vet select is required on add screen').toBe(true);
    });

    it('should send veterinarianId in addVisit payload when vet selected', () => {
        const addedVisit: Visit = {id: 2, date: '2026-10-05', description: 'vaccination', pet: testPet, veterinarianId: 1};
        const addSpy = vi.spyOn(visitService, 'addVisit').mockReturnValue(of(addedVisit));
        component.currentOwner = {id: 1} as any;
        component.visit = {
            id: null,
            date: '2026-10-05',
            description: 'vaccination',
            pet: testPet,
            veterinarianId: 1
        } as Visit;
        component.onSubmit(component.visit);
        expect(addSpy).toHaveBeenCalledTimes(1);
        expect(addSpy.mock.calls[0][0].veterinarianId, 'payload carries veterinarianId').toBe(1);
    });
});
